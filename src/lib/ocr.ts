import { AI_PROVIDER } from "@/lib/gemini"

/**
 * 이미지/PDF → 텍스트 OCR 추상화.
 *
 * 로컬(사내망) provider에서는 텍스트 전용 LLM을 쓰므로 이미지/PDF를 직접
 * 넣을 수 없다. 사내망 OCR 서비스(PaddleOCR / Tesseract 등을 HTTP로 감싼 것)를
 * 호출해 먼저 텍스트로 변환한 뒤 LLM에 텍스트로 전달한다.
 *
 * 환경변수 (AI_PROVIDER=local 일 때):
 *   OCR_BASE_URL=http://사내OCR서버:8080      # 필수
 *   OCR_API_KEY=...                            # 선택 (인증 있으면)
 *
 * OCR 서비스 계약(가정):
 *   POST {OCR_BASE_URL}/ocr
 *   - 요청: multipart/form-data, 필드명 "file"
 *   - 응답: { "text": "추출된 전체 텍스트" }
 * 사내 OCR 서비스의 실제 형식이 다르면 callOcrService만 수정하면 된다.
 */

const OCR_BASE_URL = process.env.OCR_BASE_URL || ""
const OCR_API_KEY = process.env.OCR_API_KEY || ""

/** 현재 provider에서 OCR 선처리가 필요한지 여부. */
export function needsOcr(): boolean {
  return AI_PROVIDER === "local"
}

/**
 * 이미지/PDF 바이트를 텍스트로 변환한다.
 * gemini provider에서는 호출되지 않아야 한다(멀티모달 직접 처리).
 */
export async function ocrToText(
  bytes: ArrayBuffer,
  mimeType: string,
  filename: string
): Promise<string> {
  if (!OCR_BASE_URL) {
    throw new Error(
      "OCR_BASE_URL이 설정되지 않았습니다. (AI_PROVIDER=local에서 이미지/PDF 처리 필요)"
    )
  }

  const form = new FormData()
  form.append("file", new Blob([bytes], { type: mimeType }), filename)

  const res = await fetch(`${OCR_BASE_URL}/ocr`, {
    method: "POST",
    headers: OCR_API_KEY ? { Authorization: `Bearer ${OCR_API_KEY}` } : {},
    body: form,
  })

  if (!res.ok) {
    throw new Error(
      `OCR 서비스 호출 실패 (${res.status}): ${await res.text().catch(() => "")}`
    )
  }

  const data = (await res.json()) as { text?: string }
  if (!data.text || !data.text.trim()) {
    throw new Error("OCR 결과 텍스트가 비어 있습니다.")
  }
  return data.text
}
