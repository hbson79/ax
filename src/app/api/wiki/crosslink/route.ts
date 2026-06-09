import { NextResponse } from "next/server"
import { getSupabase } from "@/lib/supabase"

// 모든 wiki에 대해 의미적으로 가까운 문서 top-N을 related_ids로 저장한다.
// Karpathy LLM Wiki 패턴의 'interlinked'(상호 링크)에 해당.
export async function POST() {
  try {
    const supabase = getSupabase()

    const { data: docs, error } = await supabase.from("wiki").select("id")
    if (error) {
      console.error("wiki id select error:", error)
      return NextResponse.json(
        { error: "wiki 목록 조회에 실패했습니다." },
        { status: 500 }
      )
    }

    const ids = (docs ?? []).map((d) => d.id as string)
    let linked = 0

    for (const id of ids) {
      const { data: related, error: relError } = await supabase.rpc(
        "related_wiki",
        { source_id: id, match_count: 3, min_similarity: 0.5 }
      )
      if (relError) {
        console.error(`related_wiki(${id}) error:`, relError)
        continue
      }
      const relatedIds = (related ?? []).map((r: { id: string }) => r.id)
      const { error: updateError } = await supabase
        .from("wiki")
        .update({ related_ids: relatedIds })
        .eq("id", id)
      if (updateError) {
        console.error(`related_ids update(${id}) error:`, updateError)
        continue
      }
      if (relatedIds.length > 0) linked++
    }

    return NextResponse.json({ total: ids.length, linked })
  } catch (error) {
    console.error("wiki crosslink error:", error)
    return NextResponse.json(
      { error: "관련 문서 연결 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
