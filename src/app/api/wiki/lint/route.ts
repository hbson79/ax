import { NextResponse } from "next/server"
import { getSupabase } from "@/lib/supabase"
import type { DuplicatePair, WikiDoc } from "@/types"

// 이 일수 이상 갱신되지 않은 wiki는 '노후'로 본다.
const STALE_DAYS = 90
// 근거 사례가 이 수 이하면 '사례 부족'으로 본다.
const LOW_CONFIDENCE_CASES = 1
// 중복 의심으로 볼 wiki 쌍 유사도 임계값.
const DUPLICATE_SIMILARITY = 0.85

export async function GET() {
  try {
    const supabase = getSupabase()

    // 1) 중복 의심 쌍 (DB RPC)
    const { data: dupData, error: dupError } = await supabase.rpc(
      "wiki_duplicate_pairs",
      { min_similarity: DUPLICATE_SIMILARITY, max_pairs: 20 }
    )
    if (dupError) {
      console.error("wiki_duplicate_pairs rpc error:", dupError)
      return NextResponse.json(
        { error: "중복 점검에 실패했습니다." },
        { status: 500 }
      )
    }

    // 2) 전체 wiki를 불러와 노후·저신뢰 계산 (임베딩 제외)
    const { data: wikiData, error: wikiError } = await supabase
      .from("wiki")
      .select(
        "id, title, category, symptom_summary, cause, procedure, prevention, source_report_ids, updated_at, created_at"
      )
      .order("updated_at", { ascending: true })

    if (wikiError) {
      console.error("wiki select error:", wikiError)
      return NextResponse.json(
        { error: "wiki 목록 조회에 실패했습니다." },
        { status: 500 }
      )
    }

    const wiki = (wikiData ?? []) as WikiDoc[]
    const staleBefore = Date.now() - STALE_DAYS * 24 * 60 * 60 * 1000

    const stale = wiki.filter((w) => {
      if (!w.updated_at) return false
      return new Date(w.updated_at).getTime() < staleBefore
    })

    const lowConfidence = wiki.filter(
      (w) => (w.source_report_ids?.length ?? 0) <= LOW_CONFIDENCE_CASES
    )

    return NextResponse.json({
      duplicates: (dupData ?? []) as DuplicatePair[],
      stale,
      lowConfidence,
      total: wiki.length,
    })
  } catch (error) {
    console.error("wiki lint error:", error)
    return NextResponse.json(
      { error: "wiki 점검 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
