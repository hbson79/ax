import { getSupabase } from "@/lib/supabase"

/**
 * 즉시 조치 안내 생성용 기본 프롬프트.
 * guidance_prompts 테이블이 비어 있거나 조회에 실패할 때 사용하는 폴백.
 */
export const DEFAULT_GUIDANCE_PROMPT = `당신은 지하철 관제 센터의 고장처치 보조 AI입니다.
관제사가 현장 승무원에게 무전으로 즉시 전달할 수 있도록, 아래 검색된 고장처치 위키 문서들을 근거로
간결하고 정확한 '즉시 조치 안내'를 작성하세요.

[작성 규칙]
- 무전으로 읽어줄 수 있도록 핵심 조치 절차를 단계별로 명확하게 제시합니다.
- 반드시 검색된 문서에 근거하여 작성하고, 근거가 부족하면 솔직하게 "관련 사례가 부족합니다"라고 안내하세요.
- 마크다운으로 작성하되 과도하게 길지 않게 핵심만 담으세요.`

/**
 * 현재 활성으로 선택된 GUIDANCE_PROMPT를 가져온다.
 * 활성 프롬프트가 없거나 조회 실패 시 기본 프롬프트를 반환한다.
 */
export async function getActiveGuidancePrompt(): Promise<string> {
  try {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from("guidance_prompts")
      .select("content")
      .eq("is_active", true)
      .maybeSingle()

    if (error) {
      console.error("guidance_prompts select error:", error)
      return DEFAULT_GUIDANCE_PROMPT
    }
    return data?.content?.trim() || DEFAULT_GUIDANCE_PROMPT
  } catch (error) {
    console.error("getActiveGuidancePrompt error:", error)
    return DEFAULT_GUIDANCE_PROMPT
  }
}
