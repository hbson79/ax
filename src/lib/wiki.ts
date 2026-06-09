// wiki 정제·병합 공통 로직 (generate / lint-merge에서 공유)

export interface WikiDocFields {
  title: string
  category: string
  symptom_summary: string
  cause: string
  procedure: string
  prevention: string
}

export const JSON_FORMAT = `[출력 형식] 아래 JSON만 출력하세요. 부연 설명 금지.
{
  "title": "고장 유형을 나타내는 명확한 제목",
  "category": "분류 (제동/출입문/추진/신호/공조/기타 중 하나)",
  "symptom_summary": "대표 증상 요약 (1~2문장)",
  "cause": "추정 원인",
  "procedure": "마크다운 형식의 단계별 조치 절차",
  "prevention": "예방 및 주의사항"
}`

export const GENERATE_PROMPT = `당신은 지하철 차량 고장처치 지식을 정리하는 전문가입니다.
여러 건의 현장 고장 보고(raw 데이터)를 종합하여, 현장 승무원과 관제사가 즉시 활용할 수 있는
하나의 '고장처치 위키 문서'로 정제하세요.

[작성 규칙]
- 흩어진 보고들의 공통 증상/원인/조치를 통합하여 신뢰할 수 있는 표준 절차로 정리합니다.
- 보고에 없는 내용을 지어내지 말고, 데이터에 근거해 작성하세요.
- procedure는 번호 매긴 단계별 조치 절차로, 마크다운으로 작성합니다.

${JSON_FORMAT}`

export const MERGE_PROMPT = `당신은 지하철 차량 고장처치 지식을 정리하는 전문가입니다.
이미 정리된 '기존 고장처치 위키 문서'에, 새로 들어온 현장 고장 보고들을 반영하여
문서를 더 정확하고 풍부하게 '보강·갱신'하세요.

[작성 규칙]
- 기존 문서의 좋은 내용은 유지하되, 새 보고에서 확인된 추가 증상·원인·조치를 통합합니다.
- 새 보고가 기존 절차를 보완하면 절차를 더 정교하게 다듬습니다. 상충하면 더 일반적인 표준 절차로 정리합니다.
- 보고에 없는 내용을 지어내지 말고, 기존 문서와 새 보고 데이터에만 근거하세요.
- procedure는 번호 매긴 단계별 조치 절차로, 마크다운으로 작성합니다.

${JSON_FORMAT}`

export const DEDUPE_PROMPT = `당신은 지하철 차량 고장처치 지식을 정리하는 전문가입니다.
중복으로 의심되는 두 개의 고장처치 위키 문서를, 정보 손실 없이 '하나의 통합 문서'로 합치세요.

[작성 규칙]
- 두 문서의 증상·원인·조치·예방을 모두 검토해, 더 정확하고 완전한 단일 표준 문서로 통합합니다.
- 한쪽에만 있는 유용한 정보는 빠뜨리지 말고 반영합니다. 상충하면 더 일반적·안전한 절차로 정리합니다.
- 없는 내용을 지어내지 말고, 두 문서 내용에만 근거하세요.
- procedure는 번호 매긴 단계별 조치 절차로, 마크다운으로 작성합니다.

${JSON_FORMAT}`

/** wiki 핵심 필드를 임베딩용 단일 텍스트로 합친다. */
export function embedTextOf(doc: WikiDocFields): string {
  return [
    doc.title,
    doc.category,
    doc.symptom_summary,
    doc.cause,
    doc.procedure,
    doc.prevention,
  ]
    .filter(Boolean)
    .join("\n")
}
