"use client"

import { ShieldCheck, ShieldAlert, Shield } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getConfidence, type ConfidenceLevel } from "@/lib/confidence"
import type { WikiDoc } from "@/types"

const CONFIDENCE_STYLE: Record<
  ConfidenceLevel,
  { variant: "default" | "secondary" | "destructive"; Icon: typeof Shield }
> = {
  high: { variant: "default", Icon: ShieldCheck },
  medium: { variant: "secondary", Icon: Shield },
  low: { variant: "destructive", Icon: ShieldAlert },
}

interface WikiCardProps {
  doc: WikiDoc
  /** 검색어가 입력된 경우에만 본문(증상·원인·조치·예방)을 펼쳐서 표시 */
  showBody?: boolean
}

function Field({ label, value }: { label: string; value?: string }) {
  if (!value) return null
  return (
    <div className="space-y-1">
      <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
        {label}
      </p>
      <p className="text-foreground text-sm whitespace-pre-wrap">{value}</p>
    </div>
  )
}

export function WikiCard({ doc, showBody = true }: WikiCardProps) {
  const confidence = getConfidence(doc)
  const { variant, Icon } = CONFIDENCE_STYLE[confidence.level]
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center gap-2">
          {doc.category && <Badge variant="secondary">{doc.category}</Badge>}
          {typeof doc.similarity === "number" && (
            <Badge variant="outline">
              유사도 {Math.round(doc.similarity * 100)}%
            </Badge>
          )}
          <Badge variant={variant} className="gap-1">
            <Icon className="h-3 w-3" />
            {confidence.label} · 근거 {confidence.cases}건
          </Badge>
        </div>
        <CardTitle className="text-lg">{doc.title}</CardTitle>
      </CardHeader>
      {showBody && (
        <CardContent className="space-y-4">
          <Field label="증상" value={doc.symptom_summary} />
          <Field label="추정 원인" value={doc.cause} />
          <Field label="조치 절차" value={doc.procedure} />
          <Field label="예방 · 주의" value={doc.prevention} />
        </CardContent>
      )}
    </Card>
  )
}
