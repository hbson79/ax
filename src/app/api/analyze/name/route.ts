import { NextRequest, NextResponse } from "next/server"
import { getSupabase } from "@/lib/supabase"

export async function PATCH(request: NextRequest) {
  try {
    const { old_name, new_name, start_date } = await request.json()

    if (!old_name?.trim() || !new_name?.trim() || !start_date) {
      return NextResponse.json(
        { error: "식당 이름과 날짜 정보가 필요합니다." },
        { status: 400 }
      )
    }

    const trimmedNewName = new_name.trim()

    if (old_name === trimmedNewName) {
      return NextResponse.json({ success: true })
    }

    const supabase = getSupabase()

    const { error } = await supabase
      .from("menu_analyses")
      .update({ cafeteria_name: trimmedNewName })
      .eq("cafeteria_name", old_name)

    if (error) {
      console.error("Cafeteria name update error:", error)
      return NextResponse.json(
        { error: "식당 이름 수정에 실패했습니다." },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Name update error:", error)
    return NextResponse.json(
      { error: "식당 이름 수정 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
