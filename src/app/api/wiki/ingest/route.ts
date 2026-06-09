import { NextResponse } from "next/server"
import { getSupabase } from "@/lib/supabase"
import { upsertWikiFromReports } from "@/lib/wiki"
import type { RawReport } from "@/types"

// 한 번의 요청에서 처리할 미처리 보고 최대 건수 (타임아웃 방지)
const BATCH_LIMIT = 20

// 미처리(ingested=false) 고장 보고를 한 건씩 자동으로 wiki에 분류·병합한다.
// 사람의 수동 선택 없이 AI가 관련 wiki에 보강하거나 신규 생성한다.
export async function POST() {
  try {
    const supabase = getSupabase()

    const { data: pending, error } = await supabase
      .from("raw_reports")
      .select("*")
      .eq("ingested", false)
      .order("occurred_at", { ascending: true, nullsFirst: false })
      .limit(BATCH_LIMIT)

    if (error) {
      console.error("pending reports select error:", error)
      return NextResponse.json(
        { error: "미처리 보고 조회에 실패했습니다." },
        { status: 500 }
      )
    }

    const reports = (pending ?? []) as RawReport[]
    if (reports.length === 0) {
      return NextResponse.json({
        processed: 0,
        created: 0,
        merged: 0,
        remaining: 0,
      })
    }

    let created = 0
    let merged = 0
    let processed = 0

    // 한 건씩 처리 — 유사한 보고는 같은 wiki로 병합되어 자기조직화된다.
    for (const report of reports) {
      try {
        const result = await upsertWikiFromReports(
          supabase,
          [report],
          [report.id!]
        )
        if (result.merged) merged++
        else created++
        await supabase
          .from("raw_reports")
          .update({ ingested: true })
          .eq("id", report.id!)
        processed++
      } catch (e) {
        // 한 건 실패가 전체를 막지 않도록 로깅 후 계속
        console.error(`ingest report ${report.id} failed:`, e)
      }
    }

    // 남은 미처리 건수
    const { count } = await supabase
      .from("raw_reports")
      .select("id", { count: "exact", head: true })
      .eq("ingested", false)

    return NextResponse.json({
      processed,
      created,
      merged,
      remaining: count ?? 0,
    })
  } catch (error) {
    console.error("wiki ingest error:", error)
    return NextResponse.json(
      { error: "자동 정리 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}

// 미처리 보고 건수 (버튼 표시용)
export async function GET() {
  try {
    const supabase = getSupabase()
    const { count, error } = await supabase
      .from("raw_reports")
      .select("id", { count: "exact", head: true })
      .eq("ingested", false)
    if (error) {
      console.error("pending count error:", error)
      return NextResponse.json({ pending: 0 })
    }
    return NextResponse.json({ pending: count ?? 0 })
  } catch {
    return NextResponse.json({ pending: 0 })
  }
}
