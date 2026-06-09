// wiki 정제·병합 공통 로직 (generate / ingest / lint-merge에서 공유)

import type { SupabaseClient } from "@supabase/supabase-js"
import { ai, embed, GEMINI_MODEL } from "@/lib/gemini"
import type { RawReport } from "@/types"

// 유사도가 이 값 이상인 기존 wiki가 있으면 신규 생성 대신 병합·보강한다.
// 너무 낮으면 다른 고장유형을 잘못 합칠 수 있으므로 보수적으로 설정.
export const MERGE_THRESHOLD = 0.82

export interface WikiDocFields {
  title: string
  category: string
  symptom_summary: string
  cause: string
  procedure: string
  prevention: string
}

export const JSON_FORMAT = `[출력 형식] 아래 JSON만 출력하세요. 부연 설명 금지.
{
  "title": "고장 유형을 나타내는 명확한 제목",
  "category": "분류 (제동/출입문/추진/신호/공조/기타 중 하나)",
  "symptom_summary": "대표 증상 요약 (1~2문장)",
  "cause": "추정 원인",
  "procedure": "마크다운 형식의 단계별 조치 절차",
  "prevention": "예방 및 주의사항"
}`

export const GENERATE_PROMPT = `당신은 지하철 차량 고장처치 지식을 정리하는 전문가입니다.
여러 건의 현장 고장 보고(raw 데이터)를 종합하여, 현장 승무원과 관제사가 즉시 활용할 수 있는
하나의 '고장처치 위키 문서'로 정제하세요.

[작성 규칙]
- 흩어진 보고들의 공통 증상/원인/조치를 통합하여 신뢰할 수 있는 표준 절차로 정리합니다.
- 보고에 없는 내용을 지어내지 말고, 데이터에 근거해 작성하세요.
- procedure는 번호 매긴 단계별 조치 절차로, 마크다운으로 작성합니다.

${JSON_FORMAT}`

export const MERGE_PROMPT = `당신은 지하철 차량 고장처치 지식을 정리하는 전문가입니다.
이미 정리된 '기존 고장처치 위키 문서'에, 새로 들어온 현장 고장 보고들을 반영하여
문서를 더 정확하고 풍부하게 '보강·갱신'하세요.

[작성 규칙]
- 기존 문서의 좋은 내용은 유지하되, 새 보고에서 확인된 추가 증상·원인·조치를 통합합니다.
- 새 보고가 기존 절차를 보완하면 절차를 더 정교하게 다듬습니다. 상충하면 더 일반적인 표준 절차로 정리합니다.
- 보고에 없는 내용을 지어내지 말고, 기존 문서와 새 보고 데이터에만 근거하세요.
- procedure는 번호 매긴 단계별 조치 절차로, 마크다운으로 작성합니다.

${JSON_FORMAT}`

export const DEDUPE_PROMPT = `당신은 지하철 차량 고장처치 지식을 정리하는 전문가입니다.
중복으로 의심되는 두 개의 고장처치 위키 문서를, 정보 손실 없이 '하나의 통합 문서'로 합치세요.

[작성 규칙]
- 두 문서의 증상·원인·조치·예방을 모두 검토해, 더 정확하고 완전한 단일 표준 문서로 통합합니다.
- 한쪽에만 있는 유용한 정보는 빠뜨리지 말고 반영합니다. 상충하면 더 일반적·안전한 절차로 정리합니다.
- 없는 내용을 지어내지 말고, 두 문서 내용에만 근거하세요.
- procedure는 번호 매긴 단계별 조치 절차로, 마크다운으로 작성합니다.

${JSON_FORMAT}`

/** wiki 핵심 필드를 임베딩용 단일 텍스트로 합친다. */
export function embedTextOf(doc: WikiDocFields): string {
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

/** 고장 보고들을 직렬화 텍스트로 변환한다. */
export function reportsToText(reports: RawReport[]): string {
  return reports
    .map(
      (r, i) =>
        `[보고 ${i + 1}] 호선:${r.line ?? "-"} 차량:${r.train_no ?? "-"}\n증상:${r.symptom}\n조치:${r.action ?? "-"}\n결과:${r.result ?? "-"}`
    )
    .join("\n\n")
}

export interface UpsertResult {
  wiki: Record<string, unknown>
  merged: boolean
}

/**
 * 고장 보고 묶음을 wiki로 정제해 저장한다.
 * 가장 유사한 기존 wiki(>= MERGE_THRESHOLD)가 있으면 병합·갱신하고,
 * 없으면 신규 생성한다. generate/ingest가 공유.
 */
export async function upsertWikiFromReports(
  supabase: SupabaseClient,
  reports: RawReport[],
  reportIds: string[]
): Promise<UpsertResult> {
  const reportsText = reportsToText(reports)

  // 1) 새 보고 임베딩으로 가장 유사한 기존 wiki 탐색
  const reportEmbedding = await embed(reportsText, "RETRIEVAL_QUERY")
  const { data: similar, error: matchError } = await supabase.rpc(
    "match_wiki",
    { query_embedding: reportEmbedding, match_count: 1 }
  )
  if (matchError) console.error("match_wiki rpc error:", matchError)

  const top = (similar as { id: string; similarity: number }[] | null)?.[0]
  const mergeTarget = top && top.similarity >= MERGE_THRESHOLD ? top.id : null

  // 2) 병합 대상이 있으면 기존 wiki 전체를 불러옴
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
  if (!text) throw new Error("AI 응답에서 텍스트를 찾을 수 없습니다.")

  const doc = JSON.parse(text) as WikiDocFields
  const embedding = await embed(embedTextOf(doc), "RETRIEVAL_DOCUMENT")

  // 3) 병합이면 UPDATE(출처 합집합), 아니면 INSERT
  if (mergeTarget && existing) {
    const mergedSourceIds = Array.from(
      new Set([...existingSourceIds, ...reportIds])
    )
    const { data, error } = await supabase
      .from("wiki")
      .update({
        ...doc,
        source_report_ids: mergedSourceIds,
        embedding,
        updated_at: new Date().toISOString(),
      })
      .eq("id", mergeTarget)
      .select()
      .single()
    if (error) throw new Error("wiki 문서 갱신에 실패했습니다.")
    return { wiki: data, merged: true }
  }

  const { data, error } = await supabase
    .from("wiki")
    .insert({
      ...doc,
      source_report_ids: reportIds,
      embedding,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()
  if (error) throw new Error("wiki 문서 저장에 실패했습니다.")
  return { wiki: data, merged: false }
}
