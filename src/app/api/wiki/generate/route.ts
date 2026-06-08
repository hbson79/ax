import { NextRequest, NextResponse } from "next/server"
import { ai, embed, GEMINI_MODEL } from "@/lib/gemini"
import { getSupabase } from "@/lib/supabase"
import type { RawReport } from "@/types"

const GENERATE_PROMPT = `당신은 지하철 차량 고장처치 지식을 정리하는 전문가입니다.
여러 건의 현장 고장 보고(raw 데이터)를 종합하여, 현장 승무원과 관제사가 즉시 활용할 수 있는
하나의 '고장처치 위키 문서'로 정제하세요.

[작성 규칙]
- 흩어진 보고들의 공통 증상/원인/조치를 통합하여 신뢰할 수 있는 표준 절차로 정리합니다.
- 보고에 없는 내용을 지어내지 말고, 데이터에 근거해 작성하세요.
- procedure는 번호 매긴 단계별 조치 절차로, 마크다운으로 작성합니다.

[출력 형식] 아래 JSON만 출력하세요. 부연 설명 금지.
{
  "title": "고장 유형을 나타내는 명확한 제목",
  "category": "분류 (제동/출입문/추진/신호/공조/기타 중 하나)",
  "symptom_summary": "대표 증상 요약 (1~2문장)",
  "cause": "추정 원인",
  "procedure": "마크다운 형식의 단계별 조치 절차",
  "prevention": "예방 및 주의사항"
}`

export async function POST(request: NextRequest) {
  try {
    const { report_ids } = (await request.json()) as { report_ids?: string[] }

    if (!report_ids || report_ids.length === 0) {
      return NextResponse.json(
        { error: "wiki를 생성할 고장 보고를 선택해주세요." },
        { status: 400 }
      )
    }

    const supabase = getSupabase()
    const { data: reports, error: fetchError } = await supabase
      .from("raw_reports")
      .select("*")
      .in("id", report_ids)

    if (fetchError || !reports || reports.length === 0) {
      return NextResponse.json(
        { error: "선택한 고장 보고를 찾을 수 없습니다." },
        { status: 404 }
      )
    }

    // 보고들을 텍스트로 직렬화
    const reportsText = (reports as RawReport[])
      .map(
        (r, i) =>
          `[보고 ${i + 1}] 호선:${r.line ?? "-"} 차량:${r.train_no ?? "-"}\n증상:${r.symptom}\n조치:${r.action ?? "-"}\n결과:${r.result ?? "-"}`
      )
      .join("\n\n")

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `다음 고장 보고들을 하나의 고장처치 위키 문서로 정제해주세요.\n\n${reportsText}`,
            },
          ],
        },
      ],
      config: {
        systemInstruction: GENERATE_PROMPT,
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    })

    const text = response.text
    if (!text) {
      return NextResponse.json(
        { error: "AI 응답에서 텍스트를 찾을 수 없습니다." },
        { status: 500 }
      )
    }

    const doc = JSON.parse(text) as {
      title: string
      category: string
      symptom_summary: string
      cause: string
      procedure: string
      prevention: string
    }

    // 정제 문서 전체를 임베딩 (검색 정확도를 위해 핵심 필드를 합침)
    const embedText = [
      doc.title,
      doc.category,
      doc.symptom_summary,
      doc.cause,
      doc.procedure,
      doc.prevention,
    ]
      .filter(Boolean)
      .join("\n")

    const embedding = await embed(embedText, "RETRIEVAL_DOCUMENT")

    const { data, error } = await supabase
      .from("wiki")
      .insert({
        title: doc.title,
        category: doc.category,
        symptom_summary: doc.symptom_summary,
        cause: doc.cause,
        procedure: doc.procedure,
        prevention: doc.prevention,
        source_report_ids: report_ids,
        embedding,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("wiki insert error:", error)
      return NextResponse.json(
        { error: "wiki 문서 저장에 실패했습니다." },
        { status: 500 }
      )
    }

    return NextResponse.json({ wiki: data })
  } catch (error) {
    console.error("wiki generate error:", error)
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "AI 응답을 JSON으로 변환하는데 실패했습니다." },
        { status: 500 }
      )
    }
    return NextResponse.json(
      { error: "wiki 생성 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
