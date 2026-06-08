import { NextRequest, NextResponse } from "next/server"
import { embed } from "@/lib/gemini"
import { getSupabase } from "@/lib/supabase"

// 사용자가 수정 가능한 필드
const EDITABLE_FIELDS = [
  "title",
  "category",
  "symptom_summary",
  "cause",
  "procedure",
  "prevention",
] as const

type EditableField = (typeof EDITABLE_FIELDS)[number]
type WikiPatch = Partial<Record<EditableField, string>>

// 사용자가 위키 콘텍스트를 직접 수정·업데이트
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = (await request.json()) as WikiPatch

    const patch: WikiPatch = {}
    for (const field of EDITABLE_FIELDS) {
      const value = body[field]
      if (typeof value === "string") patch[field] = value
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json(
        { error: "수정할 내용이 없습니다." },
        { status: 400 }
      )
    }

    if (patch.title !== undefined && !patch.title.trim()) {
      return NextResponse.json(
        { error: "제목은 비워둘 수 없습니다." },
        { status: 400 }
      )
    }

    const supabase = getSupabase()

    // 검색 정확도 유지를 위해 현재 문서와 병합한 전체 텍스트로 임베딩을 재생성
    const { data: current, error: fetchError } = await supabase
      .from("wiki")
      .select("title, category, symptom_summary, cause, procedure, prevention")
      .eq("id", id)
      .single()

    if (fetchError || !current) {
      return NextResponse.json(
        { error: "수정할 위키 문서를 찾을 수 없습니다." },
        { status: 404 }
      )
    }

    const merged = { ...current, ...patch }
    const embedText = [
      merged.title,
      merged.category,
      merged.symptom_summary,
      merged.cause,
      merged.procedure,
      merged.prevention,
    ]
      .filter(Boolean)
      .join("\n")

    const embedding = await embed(embedText, "RETRIEVAL_DOCUMENT")

    const { data, error } = await supabase
      .from("wiki")
      .update({
        ...patch,
        embedding,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select(
        "id, title, category, symptom_summary, cause, procedure, prevention, source_report_ids, updated_at, created_at"
      )
      .single()

    if (error) {
      console.error("wiki update error:", error)
      return NextResponse.json(
        { error: "위키 문서 수정에 실패했습니다." },
        { status: 500 }
      )
    }

    return NextResponse.json({ wiki: data })
  } catch (error) {
    console.error("wiki PATCH error:", error)
    return NextResponse.json(
      { error: "위키 수정 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}

// 위키 문서 삭제
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = getSupabase()
    const { error } = await supabase.from("wiki").delete().eq("id", id)

    if (error) {
      console.error("wiki delete error:", error)
      return NextResponse.json(
        { error: "위키 문서 삭제에 실패했습니다." },
        { status: 500 }
      )
    }
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("wiki DELETE error:", error)
    return NextResponse.json(
      { error: "위키 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
