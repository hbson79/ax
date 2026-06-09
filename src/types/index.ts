export interface NavLink {
  label: string
  href: string
}

export interface Feature {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}

export interface FaqItem {
  question: string
  answer: string
}

/** 현장 raw 고장 보고 */
export interface RawReport {
  id?: string
  line?: string
  train_no?: string
  symptom: string
  action?: string
  result?: string
  occurred_at?: string
  source?: "text" | "upload"
  raw_text?: string
  created_at?: string
}

/** AI 정제 wiki 문서 */
export interface WikiDoc {
  id: string
  title: string
  category?: string
  symptom_summary?: string
  cause?: string
  procedure?: string
  prevention?: string
  source_report_ids?: string[]
  related_ids?: string[] // 의미적으로 가까운 관련 wiki id (cross-link)
  updated_at?: string
  created_at?: string
  similarity?: number // 검색 결과에만 포함
}

/** 즉시 조치 안내 생성 프롬프트 */
export interface GuidancePrompt {
  id: string
  name: string
  content: string
  is_active: boolean
  updated_at?: string
  created_at?: string
}

/** wiki 건강 점검 — 중복 의심 쌍 */
export interface DuplicatePair {
  a_id: string
  a_title: string
  a_category?: string
  a_cases: number
  a_updated_at?: string
  b_id: string
  b_title: string
  b_category?: string
  b_cases: number
  b_updated_at?: string
  similarity: number
}

/** wiki 건강 점검 결과 */
export interface WikiLintResult {
  duplicates: DuplicatePair[] // 병합 후보 (유사도 높은 쌍)
  stale: WikiDoc[] // 오래 갱신되지 않은 문서
  lowConfidence: WikiDoc[] // 근거 사례가 부족한 문서
  total: number // 전체 wiki 수
}

/** 관제사 RAG 검색 응답 */
export interface SearchResult {
  guidance: string // AI가 생성한 즉시 조치 안내
  matches: WikiDoc[] // 유사 wiki 문서들
}
