import { GoogleGenAI } from "@google/genai"

export const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })

export const GEMINI_MODEL = "gemini-3.5-flash"
export const EMBEDDING_MODEL = "gemini-embedding-001"
export const EMBEDDING_DIM = 768

/**
 * 텍스트를 768차원 임베딩 벡터로 변환한다.
 * - wiki 문서 저장 시: taskType "RETRIEVAL_DOCUMENT"
 * - 관제사 검색 시: taskType "RETRIEVAL_QUERY"
 */
export async function embed(
  text: string,
  taskType: "RETRIEVAL_DOCUMENT" | "RETRIEVAL_QUERY" = "RETRIEVAL_DOCUMENT"
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
