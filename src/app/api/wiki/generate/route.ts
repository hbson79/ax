import { NextRequest, NextResponse } from "next/server"
import { ai, embed, GEMINI_MODEL } from "@/lib/gemini"
import { getSupabase } from "@/lib/supabase"
import type { RawReport } from "@/types"

// 유사도가 이 값 이상인 기존 wiki가 있으면 신규 생성 대신 병합·보강한다.
// 너무 낮으면 다른 고장유형을 잘못 합칠 수 있으므로 보수적으로 설정.
const MERGE_THRESHOLD = 0.82

const JSON_FORMAT = `[출력 형식] 아래 JSON만 출력하세요. 부연 설명 금지.
{
  "title": "고장 유형을 나타내는 명확한 제목",
  "category": "분류 (제동/출입문/추진/신호/공조/기타 중 하나)",
  "symptom_summary": "대표 증상 요약 (1~2문장)",
  "cause": "추정 원인",
  "procedure": "마크다운 형식의 단계별 조치 절차",
  "prevention": "예방 및 주의사항"
}`

const GENERATE_PROMPT = `당신은 지하철 차량 고장처치 지식을 정리하는 전문가입니다.
여러 건의 현장 고장 보고(raw 데이터)를 종합하여, 현장 승무원과 관제사가 즉시 활용할 수 있는
하나의 '고장처치 위키 문서'로 정제하세요.

[작성 규칙]
- 흩어진 보고들의 공통 증상/원인/조치를 통합하여 신뢰할 수 있는 표준 절차로 정리합니다.
- 보고에 없는 내용을 지어내지 말고, 데이터에 근거해 작성하세요.
- procedure는 번호 매긴 단계별 조치 절차로, 마크다운으로 작성합니다.

${JSON_FORMAT}`

const MERGE_PROMPT = `당신은 지하철 차량 고장처치 지식을 정리하는 전문가입니다.
이미 정리된 '기존 고장처치 위키 문서'에, 새로 들어온 현장 고장 보고들을 반영하여
문서를 더 정확하고 풍부하게 '보강·갱신'하세요.

[작성 규칙]
- 기존 문서의 좋은 내용은 유지하되, 새 보고에서 확인된 추가 증상·원인·조치를 통합합니다.
- 새 보고가 기존 절차를 보완하면 절차를 더 정교하게 다듬습니다. 상충하면 더 일반적인 표준 절차로 정리합니다.
- 보고에 없는 내용을 지어내지 말고, 기존 문서와 새 보고 데이터에만 근거하세요.
- procedure는 번호 매긴 단계별 조치 절차로, 마크다운으로 작성합니다.

${JSON_FORMAT}`

interface WikiDocFields {
  title: string
  category: string
  symptom_summary: string
  cause: string
  procedure: string
  prevention: string
}

function embedTextOf(doc: WikiDocFields): string {
  return [
    doc.title,
    doc.category,
    doc.symptom_summary,
    doc.cause,
    doc.procedure,
    doc.prevention,
  ]
    .filter(Boolean)
    .join("\n")
}

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

    // 1) 새 보고 임베딩으로 가장 유사한 기존 wiki를 먼저 탐색
    const reportEmbedding = await embed(reportsText, "RETRIEVAL_QUERY")
    const { data: similar, error: matchError } = await supabase.rpc(
      "match_wiki",
      { query_embedding: reportEmbedding, match_count: 1 }
    )
    if (matchError) {
      console.error("match_wiki rpc error:", matchError)
    }

    const top = (similar as { id: string; similarity: number }[] | null)?.[0]
    const mergeTarget = top && top.similarity >= MERGE_THRESHOLD ? top.id : null

    // 2) 병합 대상이 있으면 기존 wiki 전체를 불러와 LLM에 함께 전달
    let existing: WikiDocFields | null = null
    let existingSourceIds: string[] = []
    if (mergeTarget) {
      const { data: cur } = await supabase
        .from("wiki")
        .select(
          "title, category, symptom_summary, cause, procedure, prevention, source_report_ids"
        )
        .eq("id", mergeTarget)
        .single()
      if (cur) {
        existing = cur as WikiDocFields
        existingSourceIds = (cur.source_report_ids as string[] | null) ?? []
      }
    }

    const userText = existing
      ? `[기존 위키 문서]\n제목:${existing.title}\n분류:${existing.category}\n증상:${existing.symptom_summary}\n원인:${existing.cause}\n조치절차:\n${existing.procedure}\n예방:${existing.prevention}\n\n[새 고장 보고]\n${reportsText}\n\n위 기존 문서를 새 보고로 보강·갱신해주세요.`
      : `다음 고장 보고들을 하나의 고장처치 위키 문서로 정제해주세요.\n\n${reportsText}`

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [{ role: "user", parts: [{ text: userText }] }],
      config: {
        systemInstruction: existing ? MERGE_PROMPT : GENERATE_PROMPT,
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

    const doc = JSON.parse(text) as WikiDocFields

    // 정제 문서 전체를 임베딩 (검색 정확도를 위해 핵심 필드를 합침)
    const embedding = await embed(embedTextOf(doc), "RETRIEVAL_DOCUMENT")

    // 3) 병합이면 UPDATE(출처 합집합), 아니면 INSERT
    if (mergeTarget && existing) {
      const mergedSourceIds = Array.from(
        new Set([...existingSourceIds, ...report_ids])
      )
      const { data, error } = await supabase
        .from("wiki")
        .update({
          title: doc.title,
          category: doc.category,
          symptom_summary: doc.symptom_summary,
          cause: doc.cause,
          procedure: doc.procedure,
          prevention: doc.prevention,
          source_report_ids: mergedSourceIds,
          embedding,
          updated_at: new Date().toISOString(),
        })
        .eq("id", mergeTarget)
        .select()
        .single()

      if (error) {
        console.error("wiki update error:", error)
        return NextResponse.json(
          { error: "wiki 문서 갱신에 실패했습니다." },
          { status: 500 }
        )
      }
      return NextResponse.json({ wiki: data, merged: true })
    }

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

    return NextResponse.json({ wiki: data, merged: false })
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
