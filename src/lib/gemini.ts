import { GoogleGenAI } from "@google/genai"

/**
 * AI provider 추상화 레이어.
 *
 * AI_PROVIDER 환경변수로 백엔드를 전환한다.
 * - "gemini" (기본): Google Gemini API (외부망 필요)
 * - "local": OpenAI 호환 엔드포인트 (사내망 로컬 LLM: Ollama, vLLM 등)
 *
 * 로컬 전환 시 필요한 환경변수:
 *   AI_PROVIDER=local
 *   LOCAL_AI_BASE_URL=http://사내LLM서버:11434/v1   (Ollama 예시)
 *   LOCAL_AI_API_KEY=sk-...                          (없으면 임의값)
 *   LOCAL_CHAT_MODEL=qwen2.5:14b
 *   LOCAL_EMBED_MODEL=bge-m3
 *
 * 주의: 임베딩 모델을 바꾸면 벡터 공간이 달라지므로,
 * 기존에 저장된 모든 wiki 임베딩을 재생성(re-embed)해야 검색이 정상 동작한다.
 * 또한 EMBEDDING_DIM이 모델과 일치해야 하며, DB의 vector 차원도 맞춰야 한다.
 */

export type AiProvider = "gemini" | "local"

export const AI_PROVIDER: AiProvider =
  (process.env.AI_PROVIDER as AiProvider) || "gemini"

export const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" })

export const GEMINI_MODEL = "gemini-3.5-flash"
export const EMBEDDING_MODEL = "gemini-embedding-001"
// bge-m3 사용 시 1024로 변경하고 DB 벡터 차원도 함께 변경할 것
export const EMBEDDING_DIM = Number(process.env.EMBEDDING_DIM) || 768

// ---- 로컬(OpenAI 호환) 설정 ----
const LOCAL_BASE_URL = process.env.LOCAL_AI_BASE_URL || ""
const LOCAL_API_KEY = process.env.LOCAL_AI_API_KEY || "not-needed"
const LOCAL_CHAT_MODEL = process.env.LOCAL_CHAT_MODEL || "qwen2.5:14b"
const LOCAL_EMBED_MODEL = process.env.LOCAL_EMBED_MODEL || "bge-m3"

/**
 * provider별 필수 설정을 검증한다. 누락 시 호출 진입점에서 명확히 실패시킨다.
 */
function assertConfig(): void {
  if (AI_PROVIDER === "local") {
    if (!LOCAL_BASE_URL) {
      throw new Error(
        "AI_PROVIDER=local 이지만 LOCAL_AI_BASE_URL이 설정되지 않았습니다."
      )
    }
  } else if (!process.env.GEMINI_API_KEY) {
    throw new Error(
      "AI_PROVIDER=gemini 이지만 GEMINI_API_KEY가 설정되지 않았습니다."
    )
  }
}

// =====================================================================
// 텍스트 생성
// =====================================================================

type Part =
  | { text: string }
  | { inlineData: { mimeType: string; data: string } }

export interface GenerateArgs {
  contents: Array<{ role: string; parts: Part[] }>
  systemInstruction: string
  /** JSON 응답 강제 여부 (Gemini의 responseMimeType: application/json 대응) */
  json?: boolean
  temperature?: number
}

export interface GenerateResult {
  /** 모델이 생성한 텍스트. JSON 모드면 JSON 문자열. */
  text: string
}

/**
 * provider 중립적인 텍스트 생성 함수.
 * 호출부는 Gemini의 generateContent와 거의 동일한 형태로 사용한다.
 */
export async function generate(args: GenerateArgs): Promise<GenerateResult> {
  assertConfig()
  if (AI_PROVIDER === "local") {
    return generateLocal(args)
  }
  return generateGemini(args)
}

async function generateGemini(args: GenerateArgs): Promise<GenerateResult> {
  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: args.contents,
    config: {
      systemInstruction: args.systemInstruction,
      ...(args.json ? { responseMimeType: "application/json" } : {}),
      ...(args.temperature !== undefined
        ? { temperature: args.temperature }
        : {}),
    },
  })

  const text = response.text
  if (!text) throw new Error("AI 응답에서 텍스트를 찾을 수 없습니다.")
  return { text }
}

/**
 * OpenAI Chat Completions 호환 엔드포인트 호출 (Ollama / vLLM 등).
 *
 * 멀티모달(이미지/PDF inlineData) 제약:
 * 텍스트 전용 로컬 모델은 inlineData를 처리할 수 없다. 이미지/PDF를 다루려면
 * 비전 모델(예: Qwen2-VL)을 쓰거나, OCR로 먼저 텍스트화한 뒤 호출해야 한다.
 * 여기서는 비전 모델이 OpenAI image_url(base64 data URL) 형식을 지원한다고 가정해
 * inlineData를 data URL로 변환한다. 텍스트 전용 모델이면 이미지 part는 무시된다.
 */
async function generateLocal(args: GenerateArgs): Promise<GenerateResult> {
  const messages: Array<Record<string, unknown>> = [
    { role: "system", content: args.systemInstruction },
  ]

  for (const turn of args.contents) {
    const textParts: string[] = []
    const contentArr: Array<Record<string, unknown>> = []
    let hasImage = false

    for (const part of turn.parts) {
      if ("text" in part) {
        textParts.push(part.text)
        contentArr.push({ type: "text", text: part.text })
      } else {
        hasImage = true
        const dataUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`
        contentArr.push({ type: "image_url", image_url: { url: dataUrl } })
      }
    }

    messages.push({
      role: turn.role === "model" ? "assistant" : turn.role,
      // 이미지가 없으면 단순 문자열로(호환성↑), 있으면 멀티파트 배열로
      content: hasImage ? contentArr : textParts.join("\n"),
    })
  }

  const body: Record<string, unknown> = {
    model: LOCAL_CHAT_MODEL,
    messages,
    ...(args.temperature !== undefined
      ? { temperature: args.temperature }
      : {}),
    ...(args.json ? { response_format: { type: "json_object" } } : {}),
  }

  const res = await fetch(`${LOCAL_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${LOCAL_API_KEY}`,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    throw new Error(
      `로컬 LLM 호출 실패 (${res.status}): ${await res.text().catch(() => "")}`
    )
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>
  }
  const text = data.choices?.[0]?.message?.content
  if (!text) throw new Error("AI 응답에서 텍스트를 찾을 수 없습니다.")
  return { text }
}

// =====================================================================
// 임베딩
// =====================================================================

/**
 * 텍스트를 임베딩 벡터로 변환한다.
 * - wiki 문서 저장 시: taskType "RETRIEVAL_DOCUMENT"
 * - 관제사 검색 시: taskType "RETRIEVAL_QUERY"
 *
 * 로컬 모델(bge-m3 등)은 taskType 개념이 없어 무시된다.
 */
export async function embed(
  text: string,
  taskType: "RETRIEVAL_DOCUMENT" | "RETRIEVAL_QUERY" = "RETRIEVAL_DOCUMENT"
): Promise<number[]> {
  assertConfig()
  if (AI_PROVIDER === "local") {
    return embedLocal(text)
  }
  return embedGemini(text, taskType)
}

async function embedGemini(
  text: string,
  taskType: "RETRIEVAL_DOCUMENT" | "RETRIEVAL_QUERY"
): Promise<number[]> {
  const res = await ai.models.embedContent({
    model: EMBEDDING_MODEL,
    contents: text,
    config: {
      taskType,
      outputDimensionality: EMBEDDING_DIM,
    },
  })

  const values = res.embeddings?.[0]?.values
  if (!values) {
    throw new Error("임베딩 생성에 실패했습니다.")
  }
  return values
}

async function embedLocal(text: string): Promise<number[]> {
  const res = await fetch(`${LOCAL_BASE_URL}/embeddings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${LOCAL_API_KEY}`,
    },
    body: JSON.stringify({ model: LOCAL_EMBED_MODEL, input: text }),
  })

  if (!res.ok) {
    throw new Error(
      `로컬 임베딩 호출 실패 (${res.status}): ${await res
        .text()
        .catch(() => "")}`
    )
  }

  const data = (await res.json()) as {
    data?: Array<{ embedding?: number[] }>
  }
  const values = data.data?.[0]?.embedding
  if (!values) {
    throw new Error("임베딩 생성에 실패했습니다.")
  }
  return values
}
