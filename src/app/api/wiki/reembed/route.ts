import { NextResponse } from "next/server"
import { getSupabase } from "@/lib/supabase"
import { embed, AI_PROVIDER, EMBEDDING_DIM } from "@/lib/gemini"
import { embedTextOf } from "@/lib/wiki"

/**
 * 전체 wiki 임베딩 재생성.
 *
 * AI provider(특히 임베딩 모델)를 바꾸면 벡터 공간이 달라져 기존 임베딩으로는
 * 검색이 깨진다. 이 엔드포인트는 모든 wiki 행을 현재 AI_PROVIDER 설정에 맞춰
 * 다시 임베딩한다.
 *
 * 사용 (개발 서버가 떠 있는 상태에서):
 *   curl -X POST http://localhost:3000/api/wiki/reembed
 *
 * 선행 조건: local provider로 전환하며 차원이 달라졌다면(예: 768→1024),
 * DB의 wiki.embedding / match_wiki 함수의 vector 차원을 먼저 변경해야 한다.
 * (supabase/migrations 참고)
 *
 * 주의: 운영 노출용이 아닌 일회성 마이그레이션 도구다. 외부 공개 환경이라면
 * 인증을 추가하거나 실행 후 제거할 것.
 */

const BATCH_SIZE = 20

export async function POST() {
  const supabase = getSupabase()

  const { data: rows, error } = await supabase
    .from("wiki")
    .select(
      "id, title, category, symptom_summary, cause, procedure, prevention"
    )

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const total = rows?.length ?? 0
  let updated = 0
  const failures: Array<{ id: string; error: string }> = []

  for (let i = 0; i < total; i += BATCH_SIZE) {
    const batch = rows!.slice(i, i + BATCH_SIZE)

    // 배치 내에서는 병렬로 임베딩 생성
    const results = await Promise.allSettled(
      batch.map(async (row) => {
        const text = embedTextOf(row)
        const embedding = await embed(text, "RETRIEVAL_DOCUMENT")
        const { error: upErr } = await supabase
          .from("wiki")
          .update({ embedding })
          .eq("id", row.id)
        if (upErr) throw new Error(upErr.message)
        return row.id
      })
    )

    results.forEach((r, idx) => {
      if (r.status === "fulfilled") {
        updated++
      } else {
        failures.push({
          id: batch[idx].id,
          error: r.reason?.message ?? String(r.reason),
        })
      }
    })
  }

  return NextResponse.json({
    provider: AI_PROVIDER,
    embeddingDim: EMBEDDING_DIM,
    total,
    updated,
    failed: failures.length,
    failures: failures.slice(0, 20),
  })
}
