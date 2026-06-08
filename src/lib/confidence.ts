import type { WikiDoc } from "@/types"

export type ConfidenceLevel = "high" | "medium" | "low"

export interface Confidence {
  level: ConfidenceLevel
  cases: number // 근거가 된 raw 보고 건수
  label: string // 배지 문구
}

/**
 * wiki 문서의 신뢰도를 근거 사례(source_report_ids) 수로 산정한다.
 * - high: 3건 이상  → 여러 사례로 검증된 표준 절차
 * - medium: 2건     → 사례가 어느 정도 쌓임
 * - low: 1건 이하   → 사례 부족, 참고용
 */
export function getConfidence(doc: WikiDoc): Confidence {
  const cases = doc.source_report_ids?.length ?? 0
  if (cases >= 3) return { level: "high", cases, label: "검증됨" }
  if (cases === 2) return { level: "medium", cases, label: "보통" }
  return { level: "low", cases, label: "사례 부족" }
}
