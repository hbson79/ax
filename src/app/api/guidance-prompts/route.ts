import { NextRequest, NextResponse } from "next/server"
import { getSupabase } from "@/lib/supabase"

// 프롬프트 목록 (활성 → 최신 수정순)
export async function GET() {
  try {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from("guidance_prompts")
      .select("id, name, content, is_active, updated_at, created_at")
      .order("is_active", { ascending: false })
      .order("updated_at", { ascending: false })

    if (error) {
      console.error("guidance_prompts select error:", error)
      return NextResponse.json(
        { error: "프롬프트 목록을 불러오지 못했습니다." },
        { status: 500 }
      )
    }
    return NextResponse.json({ prompts: data })
  } catch (error) {
    console.error("guidance_prompts GET error:", error)
    return NextResponse.json(
      { error: "프롬프트 목록 조회 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}

// 새 프롬프트 생성
export async function POST(request: NextRequest) {
  try {
    const { name, content } = (await request.json()) as {
      name?: string
      content?: string
    }

    if (!name?.trim() || !content?.trim()) {
      return NextResponse.json(
        { error: "이름과 프롬프트 내용을 모두 입력해주세요." },
        { status: 400 }
      )
    }

    const supabase = getSupabase()

    // 첫 프롬프트라면 자동으로 활성 처리
    const { count } = await supabase
      .from("guidance_prompts")
      .select("id", { count: "exact", head: true })

    const { data, error } = await supabase
      .from("guidance_prompts")
      .insert({
        name: name.trim(),
        content: content.trim(),
        is_active: (count ?? 0) === 0,
      })
      .select("id, name, content, is_active, updated_at, created_at")
      .single()

    if (error) {
      console.error("guidance_prompts insert error:", error)
      return NextResponse.json(
        { error: "프롬프트 생성에 실패했습니다." },
        { status: 500 }
      )
    }
    return NextResponse.json({ prompt: data })
  } catch (error) {
    console.error("guidance_prompts POST error:", error)
    return NextResponse.json(
      { error: "프롬프트 생성 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
