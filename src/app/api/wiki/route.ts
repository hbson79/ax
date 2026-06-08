import { NextResponse } from "next/server"
import { getSupabase } from "@/lib/supabase"

// 승무원 학습용 wiki 목록 (임베딩 제외)
export async function GET() {
  try {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from("wiki")
      .select(
        "id, title, category, symptom_summary, cause, procedure, prevention, source_report_ids, updated_at, created_at"
      )
      .order("updated_at", { ascending: false })

    if (error) {
      console.error("wiki select error:", error)
      return NextResponse.json(
        { error: "wiki 목록을 불러오지 못했습니다." },
        { status: 500 }
      )
    }
    return NextResponse.json({ wiki: data })
  } catch (error) {
    console.error("wiki GET error:", error)
    return NextResponse.json(
      { error: "wiki 목록 조회 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
