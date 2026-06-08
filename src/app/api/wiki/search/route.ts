import { NextRequest, NextResponse } from "next/server"
import { ai, embed, GEMINI_MODEL } from "@/lib/gemini"
import { getSupabase } from "@/lib/supabase"
import type { WikiDoc } from "@/types"

const GUIDANCE_PROMPT = `당신은 지하철 관제 센터의 고장처치 보조 AI입니다.
관제사가 현장 승무원에게 무전으로 즉시 전달할 수 있도록, 아래 검색된 고장처치 위키 문서들을 근거로
간결하고 정확한 '즉시 조치 안내'를 작성하세요.

[작성 규칙]
- 무전으로 읽어줄 수 있도록 핵심 조치 절차를 단계별로 명확하게 제시합니다.
- 반드시 검색된 문서에 근거하여 작성하고, 근거가 부족하면 솔직하게 "관련 사례가 부족합니다"라고 안내하세요.
- 마크다운으로 작성하되 과도하게 길지 않게 핵심만 담으세요.`

export async function POST(request: NextRequest) {
  try {
    const { query } = (await request.json()) as { query?: string }

    if (!query?.trim()) {
      return NextResponse.json(
        { error: "검색할 증상을 입력해주세요." },
        { status: 400 }
      )
    }

    // 1) 쿼리 임베딩 → 유사 wiki 검색
    const queryEmbedding = await embed(query.trim(), "RETRIEVAL_QUERY")
    const supabase = getSupabase()
    const { data: matches, error } = await supabase.rpc("match_wiki", {
      query_embedding: queryEmbedding,
      match_count: 5,
    })

    if (error) {
      console.error("match_wiki rpc error:", error)
      return NextResponse.json(
        { error: "유사 문서 검색에 실패했습니다." },
        { status: 500 }
      )
    }

    const wikiMatches = (matches || []) as WikiDoc[]

    if (wikiMatches.length === 0) {
      return NextResponse.json({
        guidance:
          "관련된 고장처치 문서를 찾지 못했습니다. wiki를 먼저 생성해주세요.",
        matches: [],
      })
    }

    // 2) 검색 문서를 컨텍스트로 즉시 조치 안내 생성
    const context = wikiMatches
      .map(
        (w, i) =>
          `[문서 ${i + 1}] ${w.title} (${w.category ?? "-"})\n증상:${w.symptom_summary ?? "-"}\n원인:${w.cause ?? "-"}\n조치절차:\n${w.procedure ?? "-"}`
      )
      .join("\n\n")

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `현장 증상: "${query.trim()}"\n\n검색된 고장처치 문서:\n${context}\n\n위 문서를 근거로 즉시 조치 안내를 작성해주세요.`,
            },
          ],
        },
      ],
      config: {
        systemInstruction: GUIDANCE_PROMPT,
        temperature: 0.3,
      },
    })

    return NextResponse.json({
      guidance: response.text ?? "조치 안내 생성에 실패했습니다.",
      matches: wikiMatches,
    })
  } catch (error) {
    console.error("wiki search error:", error)
    return NextResponse.json(
      { error: "고장 검색 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
