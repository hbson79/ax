import { NextRequest, NextResponse } from "next/server"
import { generate } from "@/lib/gemini"
import { needsOcr, ocrToText } from "@/lib/ocr"
import { getSupabase } from "@/lib/supabase"
import type { RawReport } from "@/types"

// 업로드 문서에서 고장 보고 구조를 추출하는 시스템 프롬프트
const EXTRACT_PROMPT = `당신은 지하철 차량 고장 보고서를 분석하여 구조화된 JSON으로 변환하는 전문가입니다.
주어진 문서(이미지 또는 텍스트)에서 고장 정보를 추출하세요. 여러 건의 고장이 있으면 모두 추출합니다.

[추출 규칙]
- 문서에 명확히 적힌 내용만 추출하고, 없는 정보는 추측하지 말고 빈 문자열로 두세요.
- 날짜/시각은 ISO 8601(YYYY-MM-DDTHH:mm:ss) 형식으로 변환하되, 알 수 없으면 빈 문자열.

[출력 형식] 아래 JSON만 출력하세요. 부연 설명 금지.
{
  "reports": [
    {
      "line": "호선 (예: 2호선, 없으면 \\"\\")",
      "train_no": "차량번호 (없으면 \\"\\")",
      "symptom": "고장 증상 (필수)",
      "action": "조치 내용",
      "result": "조치 결과",
      "occurred_at": "YYYY-MM-DDTHH:mm:ss 또는 \\"\\""
    }
  ]
}`

export async function GET() {
  try {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from("raw_reports")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100)

    if (error) {
      console.error("raw_reports select error:", error)
      return NextResponse.json(
        { error: "고장 보고 목록을 불러오지 못했습니다." },
        { status: 500 }
      )
    }
    return NextResponse.json({ reports: data })
  } catch (error) {
    console.error("reports GET error:", error)
    return NextResponse.json(
      { error: "고장 보고 목록 조회 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || ""
    const supabase = getSupabase()

    // 1) 문서 업로드 (multipart/form-data)
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData()
      const file = formData.get("file") as File | null
      if (!file) {
        return NextResponse.json(
          { error: "파일이 필요합니다." },
          { status: 400 }
        )
      }

      const bytes = await file.arrayBuffer()
      const isImage = file.type.startsWith("image/")
      const isPdf = file.type === "application/pdf"

      const parts: Array<
        { inlineData: { mimeType: string; data: string } } | { text: string }
      > = []

      // 이미지/PDF에서 OCR로 추출한 텍스트(있으면). raw_reports 저장에 재사용.
      let ocrText: string | null = null

      if ((isImage || isPdf) && needsOcr()) {
        // 로컬 LLM은 멀티모달 불가 → OCR로 먼저 텍스트화
        ocrText = await ocrToText(bytes, file.type, file.name)
        parts.push({
          text: `다음 문서에서 고장 보고를 추출해주세요.\n\n---\n${ocrText}\n---`,
        })
      } else if (isImage || isPdf) {
        // gemini: 멀티모달로 파일 직접 전달
        parts.push({
          inlineData: {
            mimeType: file.type,
            data: Buffer.from(bytes).toString("base64"),
          },
        })
        parts.push({ text: "이 문서에서 고장 보고를 추출해주세요." })
      } else {
        // 텍스트 계열 파일
        const text = Buffer.from(bytes).toString("utf-8")
        parts.push({
          text: `다음 문서에서 고장 보고를 추출해주세요.\n\n---\n${text}\n---`,
        })
      }

      const response = await generate({
        contents: [{ role: "user", parts }],
        systemInstruction: EXTRACT_PROMPT,
        json: true,
        temperature: 0,
      })

      const text = response.text
      if (!text) {
        return NextResponse.json(
          { error: "AI 응답에서 텍스트를 찾을 수 없습니다." },
          { status: 500 }
        )
      }

      const parsed = JSON.parse(text) as { reports: Partial<RawReport>[] }
      const rawText = ocrText
        ? ocrText.slice(0, 10000)
        : isImage || isPdf
          ? null
          : Buffer.from(bytes).toString("utf-8").slice(0, 10000)

      const rows = (parsed.reports || [])
        .filter((r) => r.symptom?.trim())
        .map((r) => ({
          line: r.line || null,
          train_no: r.train_no || null,
          symptom: r.symptom!,
          action: r.action || null,
          result: r.result || null,
          occurred_at: r.occurred_at || null,
          source: "upload",
          raw_text: rawText,
        }))

      if (rows.length === 0) {
        return NextResponse.json(
          { error: "문서에서 고장 정보를 추출하지 못했습니다." },
          { status: 422 }
        )
      }

      const { data, error } = await supabase
        .from("raw_reports")
        .insert(rows)
        .select()

      if (error) {
        console.error("raw_reports insert error:", error)
        return NextResponse.json(
          { error: "고장 보고 저장에 실패했습니다." },
          { status: 500 }
        )
      }
      return NextResponse.json({ reports: data, count: data.length })
    }

    // 2) 텍스트 직접 입력 (application/json)
    const body = (await request.json()) as RawReport
    if (!body.symptom?.trim()) {
      return NextResponse.json(
        { error: "증상은 필수 입력 항목입니다." },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("raw_reports")
      .insert({
        line: body.line || null,
        train_no: body.train_no || null,
        symptom: body.symptom.trim(),
        action: body.action || null,
        result: body.result || null,
        occurred_at: body.occurred_at || null,
        source: "text",
      })
      .select()
      .single()

    if (error) {
      console.error("raw_reports insert error:", error)
      return NextResponse.json(
        { error: "고장 보고 저장에 실패했습니다." },
        { status: 500 }
      )
    }
    return NextResponse.json({ report: data })
  } catch (error) {
    console.error("reports POST error:", error)
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "AI 응답을 JSON으로 변환하는데 실패했습니다." },
        { status: 500 }
      )
    }
    return NextResponse.json(
      { error: "고장 보고 처리 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
