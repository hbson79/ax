import { createHash } from "crypto"
import { GoogleGenAI } from "@google/genai"
import { NextRequest, NextResponse } from "next/server"
import { getSupabase } from "@/lib/supabase"

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })

const TODAY = new Date().toISOString().split("T")[0]

// 💡 1. 한층 더 강력하고 구체적인 시스템 프롬프트
const SYSTEM_PROMPT = `당신은 복잡하고 다양한 형태의 구내식당 주간 식단표 이미지를 분석하여 완벽한 구조의 JSON 데이터로 변환하는 'AI 비전 및 데이터 정제 전문가'입니다.
어떤 형태(가로형, 세로형, 다중 코너, 복잡한 표, 흐린 글씨)의 식단표가 주어지더라도 아래 규칙에 따라 핵심 메뉴 정보만 정확히 추출해야 합니다.

[현재 시스템 기준 날짜: ${TODAY}]

[데이터 추출 및 정제 핵심 규칙 - 매우 중요]
1. 날짜 및 요일 파악:
   - 연도 표기가 없다면 [현재 시스템 기준 날짜]의 연도를 적용하세요.
   - 날짜가 명확하지 않거나 '월~금'만 표기된 경우, [현재 시스템 기준 날짜]가 속한 주의 월요일부터 순차적으로 날짜를 계산하여 기입하세요.

2. 끼니 매핑 및 휴무일:
   - 조식/아침 -> breakfast, 중식/점심 -> lunch, 석식/저녁 -> dinner
   - 운영하지 않는 날(휴무, 공휴일)이거나 메뉴가 비어있는 끼니는 해당 키를 생략하거나 빈 배열([])을 반환하세요.

3. 데이터 정제 (노이즈 완벽 제거):
   - 영양 정보 제거: 칼로리(kcal), 단백질 등 영양성분 표시는 모두 지우세요.
   - 알레르기 번호 제거: 메뉴명 옆에 붙은 숫자 기호(예: ①,②,③, (1.2.5.6) 등)는 원산지/알레르기 표시이므로 철저히 삭제하세요.
   - 특수기호 및 가격 제거: 장식용 기호(★, ■, ㆍ, -, *)와 가격(원)을 삭제하고 순수 메뉴명만 남기세요.
   - 줄바꿈 복구: 표의 칸이 좁아 줄바꿈으로 끊어진 메뉴명(예: "제육\\n볶음")은 문맥을 파악해 하나의 단어("제육볶음")로 합치세요.

4. 다중 코너 및 제외 대상 처리:
   - A코너/B코너, 한식/일품 등 여러 코너가 제공될 경우, 모든 메뉴를 해당 끼니의 배열 안에 순차적으로 담으세요. 구분이 필요하다면 "돈까스(A)", "비빔밥(B)" 처럼 괄호를 사용해 합쳐도 좋습니다.
   - "간편식", "샐러드바", "Take-out", "테이크아웃", "매점", "음료수" 등의 부가 메뉴나 간식 코너는 데이터에서 완전히 제외하세요.

  5. 환각(Hallucination) 방지 및 엄격한 텍스트 인식 (가장 중요):
  - 글씨가 흐리거나 잘 안 보여서 확실하지 않은 경우, 절대 임의로 비슷한 메뉴(예: 짜장을 고추장으로)를 추측하거나 지어내지 마세요.
  - 오직 이미지에 시각적으로 명확하게 적혀 있는 글자만 그대로 추출하세요.

[출력 형식]
반드시 아래 JSON 구조를 엄격하게 따르세요. 어떠한 부연 설명도 포함하지 마세요.
{
  "cafeteria_name": "식당 이름 (사진에서 확인 가능하면 기입, 없으면 '구내식당')",
  "start_date": "YYYY-MM-DD",
  "end_date": "YYYY-MM-DD",
  "weekly_menus": [
    {
      "date": "YYYY-MM-DD",
      "day_of_week": "월/화/수/목/금/토/일",
      "meals": {
        "breakfast": ["메뉴1", "메뉴2"],
        "lunch": ["메뉴1", "메뉴2"],
        "dinner": ["메뉴1", "메뉴2"]
      }
    }
  ]
}`

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("image") as File | null

    if (!file) {
      return NextResponse.json(
        { error: "이미지 파일이 필요합니다." },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const base64 = Buffer.from(bytes).toString("base64")

    const imageHash = createHash("sha256")
      .update(Buffer.from(bytes))
      .digest("hex")

    const supabase = getSupabase()
    const { data: cachedByHash } = await supabase
      .from("menu_analyses")
      .select("cafeteria_name, start_date, end_date, weekly_menus")
      .eq("image_hash", imageHash)
      .single()

    if (cachedByHash) {
      return NextResponse.json({ result: cachedByHash, cached: true })
    }

    // 💡 2. Gemini API 호출 시 JSON 모드 활성화
    const response = await ai.models.generateContent({
      model: "gemini-3-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: file.type,
                data: base64,
              },
            },
            {
              text: "이 구내식당 메뉴 사진을 분석해서 지정된 JSON 형식으로 완벽하게 변환해주세요.",
            },
          ],
        },
      ],
      config: {
        systemInstruction: SYSTEM_PROMPT,
        // 이 옵션을 추가하면 정규식 파싱(```json ... ```)을 안 해도 됩니다!
        responseMimeType: "application/json",
        temperature: 0, // 🔥 AI의 창의력을 0으로 만들어 사실 기반 추출만 하도록 강제합니다.
      },
    })

    const text = response.text
    if (!text) {
      return NextResponse.json(
        { error: "AI 응답에서 텍스트를 찾을 수 없습니다." },
        { status: 500 }
      )
    }

    // 💡 3. JSON 모드를 켰기 때문에 복잡한 정규식 없이 바로 파싱 가능합니다.
    const menuData = JSON.parse(text)

    // 같은 식당 + 같은 시작날짜의 캐시 확인
    const { data: cachedByMenu } = await supabase
      .from("menu_analyses")
      .select("cafeteria_name, start_date, end_date, weekly_menus")
      .eq("cafeteria_name", menuData.cafeteria_name)
      .eq("start_date", menuData.start_date)
      .single()

    if (cachedByMenu) {
      await supabase
        .from("menu_analyses")
        .update({ image_hash: imageHash })
        .eq("cafeteria_name", menuData.cafeteria_name)
        .eq("start_date", menuData.start_date)

      return NextResponse.json({ result: cachedByMenu, cached: true })
    }

    const { error: dbError } = await supabase.from("menu_analyses").insert({
      cafeteria_name: menuData.cafeteria_name,
      start_date: menuData.start_date,
      end_date: menuData.end_date,
      weekly_menus: menuData.weekly_menus,
      image_hash: imageHash,
    })

    if (dbError) {
      console.error("Supabase insert error:", dbError)
    }

    return NextResponse.json({ result: menuData, cached: false })
  } catch (error) {
    console.error("Menu analysis error:", error)

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "AI 응답을 JSON으로 변환하는데 실패했습니다." },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: "메뉴 분석 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
