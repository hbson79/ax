import { NextRequest, NextResponse } from "next/server"
import { ai, embed, GEMINI_MODEL } from "@/lib/gemini"
import { getSupabase } from "@/lib/supabase"
import { DEDUPE_PROMPT, embedTextOf, type WikiDocFields } from "@/lib/wiki"
import type { WikiDoc } from "@/types"

// 중복 의심 wiki 두 건을 하나로 통합한다.
// keepId 문서를 통합 결과로 UPDATE하고, dropId 문서는 삭제한다.
export async function POST(request: NextRequest) {
  try {
    const { keepId, dropId } = (await request.json()) as {
      keepId?: string
      dropId?: string
    }

    if (!keepId || !dropId || keepId === dropId) {
      return NextResponse.json(
        { error: "병합할 서로 다른 두 문서를 지정해주세요." },
        { status: 400 }
      )
    }

    const supabase = getSupabase()
    const { data: docs, error: fetchError } = await supabase
      .from("wiki")
      .select(
        "id, title, category, symptom_summary, cause, procedure, prevention, source_report_ids"
      )
      .in("id", [keepId, dropId])

    if (fetchError || !docs || docs.length !== 2) {
      return NextResponse.json(
        { error: "병합할 문서를 찾을 수 없습니다." },
        { status: 404 }
      )
    }

    const keep = docs.find((d) => d.id === keepId) as WikiDoc
    const drop = docs.find((d) => d.id === dropId) as WikiDoc

    const docText = (d: WikiDoc, n: number) =>
      `[문서 ${n}] 제목:${d.title}\n분류:${d.category ?? "-"}\n증상:${d.symptom_summary ?? "-"}\n원인:${d.cause ?? "-"}\n조치절차:\n${d.procedure ?? "-"}\n예방:${d.prevention ?? "-"}`

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `다음 중복 의심 문서 두 건을 하나로 통합해주세요.\n\n${docText(keep, 1)}\n\n${docText(drop, 2)}`,
            },
          ],
        },
      ],
      config: {
        systemInstruction: DEDUPE_PROMPT,
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

    const merged = JSON.parse(text) as WikiDocFields
    const embedding = await embed(embedTextOf(merged), "RETRIEVAL_DOCUMENT")

    // 출처 보고 ID 합집합 (지식 근거 보존)
    const mergedSourceIds = Array.from(
      new Set([
        ...(keep.source_report_ids ?? []),
        ...(drop.source_report_ids ?? []),
      ])
    )

    const { data: updated, error: updateError } = await supabase
      .from("wiki")
      .update({
        title: merged.title,
        category: merged.category,
        symptom_summary: merged.symptom_summary,
        cause: merged.cause,
        procedure: merged.procedure,
        prevention: merged.prevention,
        source_report_ids: mergedSourceIds,
        embedding,
        updated_at: new Date().toISOString(),
      })
      .eq("id", keepId)
      .select(
        "id, title, category, symptom_summary, cause, procedure, prevention, source_report_ids, updated_at, created_at"
      )
      .single()

    if (updateError) {
      console.error("dedupe update error:", updateError)
      return NextResponse.json(
        { error: "통합 문서 저장에 실패했습니다." },
        { status: 500 }
      )
    }

    const { error: deleteError } = await supabase
      .from("wiki")
      .delete()
      .eq("id", dropId)

    if (deleteError) {
      console.error("dedupe delete error:", deleteError)
      // 통합본은 이미 저장됨 — 삭제만 실패했음을 알린다.
      return NextResponse.json(
        { error: "통합은 됐으나 중복 문서 삭제에 실패했습니다." },
        { status: 500 }
      )
    }

    return NextResponse.json({ wiki: updated })
  } catch (error) {
    console.error("wiki dedupe error:", error)
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "AI 응답을 JSON으로 변환하는데 실패했습니다." },
        { status: 500 }
      )
    }
    return NextResponse.json(
      { error: "중복 문서 통합 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
