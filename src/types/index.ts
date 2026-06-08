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

/** 관제사 RAG 검색 응답 */
export interface SearchResult {
  guidance: string // AI가 생성한 즉시 조치 안내
  matches: WikiDoc[] // 유사 wiki 문서들
}
