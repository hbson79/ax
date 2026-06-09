import { NextRequest, NextResponse } from "next/server"
import { getSupabase } from "@/lib/supabase"
import { upsertWikiFromReports } from "@/lib/wiki"
import type { RawReport } from "@/types"

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

    const result = await upsertWikiFromReports(
      supabase,
      reports as RawReport[],
      report_ids
    )

    // 수동 생성한 보고도 ingest 완료로 표시(자동 ingest 대상에서 제외)
    await supabase
      .from("raw_reports")
      .update({ ingested: true })
      .in("id", report_ids)

    return NextResponse.json({ wiki: result.wiki, merged: result.merged })
  } catch (error) {
    console.error("wiki generate error:", error)
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "AI 응답을 JSON으로 변환하는데 실패했습니다." },
        { status: 500 }
      )
    }
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "wiki 생성 중 오류가 발생했습니다.",
      },
      { status: 500 }
    )
  }
}
