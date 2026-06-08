import { NextRequest, NextResponse } from "next/server"
import { getSupabase } from "@/lib/supabase"

type PromptPatch = {
  name?: string
  content?: string
  is_active?: boolean
}

// 프롬프트 수정 / 활성 전환
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = (await request.json()) as PromptPatch
    const supabase = getSupabase()

    const patch: PromptPatch = {}
    if (typeof body.name === "string") {
      if (!body.name.trim()) {
        return NextResponse.json(
          { error: "이름은 비워둘 수 없습니다." },
          { status: 400 }
        )
      }
      patch.name = body.name.trim()
    }
    if (typeof body.content === "string") {
      if (!body.content.trim()) {
        return NextResponse.json(
          { error: "프롬프트 내용은 비워둘 수 없습니다." },
          { status: 400 }
        )
      }
      patch.content = body.content.trim()
    }

    // 활성 전환: 항상 1개만 활성이도록, 다른 프롬프트를 먼저 비활성화
    if (body.is_active === true) {
      const { error: deactivateError } = await supabase
        .from("guidance_prompts")
        .update({ is_active: false })
        .eq("is_active", true)
        .neq("id", id)

      if (deactivateError) {
        console.error("guidance_prompts deactivate error:", deactivateError)
        return NextResponse.json(
          { error: "프롬프트 활성 전환에 실패했습니다." },
          { status: 500 }
        )
      }
      patch.is_active = true
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json(
        { error: "수정할 내용이 없습니다." },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("guidance_prompts")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("id, name, content, is_active, updated_at, created_at")
      .single()

    if (error || !data) {
      console.error("guidance_prompts update error:", error)
      return NextResponse.json(
        { error: "프롬프트 수정에 실패했습니다." },
        { status: 500 }
      )
    }
    return NextResponse.json({ prompt: data })
  } catch (error) {
    console.error("guidance_prompts PATCH error:", error)
    return NextResponse.json(
      { error: "프롬프트 수정 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}

// 프롬프트 삭제 (활성 프롬프트는 삭제 불가)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = getSupabase()

    const { data: target, error: fetchError } = await supabase
      .from("guidance_prompts")
      .select("is_active")
      .eq("id", id)
      .maybeSingle()

    if (fetchError) {
      console.error("guidance_prompts fetch error:", fetchError)
      return NextResponse.json(
        { error: "프롬프트 삭제에 실패했습니다." },
        { status: 500 }
      )
    }
    if (!target) {
      return NextResponse.json(
        { error: "삭제할 프롬프트를 찾을 수 없습니다." },
        { status: 404 }
      )
    }
    if (target.is_active) {
      return NextResponse.json(
        {
          error:
            "활성 프롬프트는 삭제할 수 없습니다. 다른 프롬프트를 먼저 활성화하세요.",
        },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from("guidance_prompts")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("guidance_prompts delete error:", error)
      return NextResponse.json(
        { error: "프롬프트 삭제에 실패했습니다." },
        { status: 500 }
      )
    }
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("guidance_prompts DELETE error:", error)
    return NextResponse.json(
      { error: "프롬프트 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
