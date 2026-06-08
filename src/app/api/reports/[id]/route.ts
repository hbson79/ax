import { NextRequest, NextResponse } from "next/server"
import { getSupabase } from "@/lib/supabase"
import type { RawReport } from "@/types"

// 사용자가 수정 가능한 필드
const EDITABLE_FIELDS = [
  "line",
  "train_no",
  "symptom",
  "action",
  "result",
  "occurred_at",
] as const

type EditableField = (typeof EDITABLE_FIELDS)[number]

// 저장된 고장 보고 수정·업데이트
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = (await request.json()) as Partial<RawReport>

    const patch: Record<string, string | null> = {}
    for (const field of EDITABLE_FIELDS) {
      const value = body[field as EditableField]
      if (value === undefined) continue
      const trimmed = typeof value === "string" ? value.trim() : value
      patch[field] = trimmed ? trimmed : null
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json(
        { error: "수정할 내용이 없습니다." },
        { status: 400 }
      )
    }

    if ("symptom" in patch && !patch.symptom) {
      return NextResponse.json(
        { error: "증상은 비워둘 수 없습니다." },
        { status: 400 }
      )
    }

    const supabase = getSupabase()
    const { data, error } = await supabase
      .from("raw_reports")
      .update(patch)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("raw_reports update error:", error)
      return NextResponse.json(
        { error: "고장 보고 수정에 실패했습니다." },
        { status: 500 }
      )
    }

    return NextResponse.json({ report: data })
  } catch (error) {
    console.error("reports PATCH error:", error)
    return NextResponse.json(
      { error: "고장 보고 수정 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}

// 저장된 고장 보고 삭제
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = getSupabase()
    const { error } = await supabase.from("raw_reports").delete().eq("id", id)

    if (error) {
      console.error("raw_reports delete error:", error)
      return NextResponse.json(
        { error: "고장 보고 삭제에 실패했습니다." },
        { status: 500 }
      )
    }
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("reports DELETE error:", error)
    return NextResponse.json(
      { error: "고장 보고 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
