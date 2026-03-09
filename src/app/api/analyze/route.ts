import { createHash } from "crypto"
import { GoogleGenAI } from "@google/genai"
import { NextRequest, NextResponse } from "next/server"
import { getSupabase } from "@/lib/supabase"

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })

const SYSTEM_PROMPT = `당신은 구내식당 메뉴 사진을 분석하는 전문가입니다.
사용자가 구내식당 주간 메뉴표 사진을 보내면, 사진에서 메뉴 정보를 정확히 추출하여 아래 JSON 형식으로 반환해주세요.

반드시 아래 JSON 형식만 반환하세요. 다른 텍스트는 포함하지 마세요.

{
  "cafeteria_name": "식당 이름 (사진에서 확인 가능하면 기입, 아니면 '구내식당')",
  "start_date": "YYYY-MM-DD (메뉴 시작 날짜)",
  "end_date": "YYYY-MM-DD (메뉴 종료 날짜)",
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
}

주의사항:
- 사진에서 읽을 수 있는 모든 메뉴를 빠짐없이 포함하세요.
- 날짜가 명확하지 않으면 오늘 날짜 기준으로 해당 주의 월요일부터 시작하세요.
- 아침/점심/저녁 구분이 없으면 해당 끼니는 생략하세요.
- 메뉴 항목은 원본 그대로 기입하세요.
- 반드시 유효한 JSON만 반환하세요.`

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

    // 1단계: 이미지 해시 계산
    const imageHash = createHash("sha256")
      .update(Buffer.from(bytes))
      .digest("hex")

    // 2단계: 동일 이미지가 이미 분석된 적 있는지 확인
    const supabase = getSupabase()
    const { data: cachedByHash } = await supabase
      .from("menu_analyses")
      .select("cafeteria_name, start_date, end_date, weekly_menus")
      .eq("image_hash", imageHash)
      .single()

    if (cachedByHash) {
      return NextResponse.json({ result: cachedByHash, cached: true })
    }

    // 3단계: Gemini API 호출
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
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
              text: "이 구내식당 메뉴 사진을 분석해서 JSON 형식으로 변환해주세요.",
            },
          ],
        },
      ],
      config: {
        systemInstruction: SYSTEM_PROMPT,
      },
    })

    const text = response.text
    if (!text) {
      return NextResponse.json(
        { error: "AI 응답에서 텍스트를 찾을 수 없습니다." },
        { status: 500 }
      )
    }

    // JSON 파싱
    let jsonText = text.trim()
    const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (jsonMatch) {
      jsonText = jsonMatch[1].trim()
    }

    const menuData = JSON.parse(jsonText)

    // 4단계: 같은 식당 + 같은 주간 데이터가 이미 있는지 확인
    const { data: cachedByMenu } = await supabase
      .from("menu_analyses")
      .select("cafeteria_name, start_date, end_date, weekly_menus")
      .eq("cafeteria_name", menuData.cafeteria_name)
      .eq("start_date", menuData.start_date)
      .single()

    if (cachedByMenu) {
      // 같은 식당/주간이 이미 있으면 이 이미지 해시만 기록하고 기존 결과 반환
      await supabase.from("menu_analyses").insert({
        cafeteria_name: menuData.cafeteria_name,
        start_date: menuData.start_date,
        end_date: menuData.end_date,
        weekly_menus: cachedByMenu.weekly_menus,
        image_hash: imageHash,
      })

      return NextResponse.json({ result: cachedByMenu, cached: true })
    }

    // 5단계: 새로운 분석 결과 저장
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
