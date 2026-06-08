"use client"

import { useCallback, useEffect, useState } from "react"
import { Loader2, Sparkles, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/layout/page-header"
import { ReportForm } from "@/components/report/report-form"
import type { RawReport } from "@/types"

export default function ReportPage() {
  const [reports, setReports] = useState<RawReport[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)

  const loadReports = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/reports")
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setReports(data.reports ?? [])
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "목록을 불러오지 못했습니다."
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadReports()
  }, [loadReports])

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const handleGenerate = async () => {
    if (selected.size === 0) {
      toast.error("위키로 만들 고장 보고를 선택해주세요.")
      return
    }
    setIsGenerating(true)
    try {
      const res = await fetch("/api/wiki/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ report_ids: Array.from(selected) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "위키 생성 실패")
      toast.success(`위키 문서 "${data.wiki.title}"가 생성되었습니다.`)
      setSelected(new Set())
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "위키 생성 실패")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <PageHeader />
      <main className="flex-1">
        <div className="container mx-auto max-w-3xl px-4 py-12 md:px-6">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              고장 보고 입력
            </h1>
            <p className="text-muted-foreground mt-2">
              현장 고장과 조치 내용을 직접 입력하거나, 기존 보고서를 업로드해
              데이터로 모읍니다.
            </p>
          </div>

          <ReportForm onSaved={loadReports} />

          {/* 누적된 raw 보고 + 위키 생성 */}
          <div className="mt-12">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">누적된 고장 보고</h2>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadReports}
                  disabled={isLoading}
                >
                  <RefreshCw
                    className={`mr-1 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                  />
                  새로고침
                </Button>
                <Button
                  size="sm"
                  onClick={handleGenerate}
                  disabled={isGenerating || selected.size === 0}
                >
                  {isGenerating ? (
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-1 h-4 w-4" />
                  )}
                  위키 생성 ({selected.size})
                </Button>
              </div>
            </div>

            {isLoading ? (
              <p className="text-muted-foreground py-8 text-center text-sm">
                불러오는 중...
              </p>
            ) : reports.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center text-sm">
                아직 등록된 고장 보고가 없습니다.
              </p>
            ) : (
              <div className="space-y-2">
                {reports.map((r) => (
                  <Card
                    key={r.id}
                    className="flex cursor-pointer flex-row items-start gap-3 p-4"
                    onClick={() => r.id && toggle(r.id)}
                  >
                    <Checkbox
                      checked={r.id ? selected.has(r.id) : false}
                      className="mt-0.5"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-1.5">
                        {r.line && <Badge variant="secondary">{r.line}</Badge>}
                        {r.train_no && (
                          <Badge variant="outline">{r.train_no}</Badge>
                        )}
                        {r.source === "upload" && (
                          <Badge variant="outline">업로드</Badge>
                        )}
                      </div>
                      <p className="text-foreground text-sm font-medium">
                        {r.symptom}
                      </p>
                      {r.action && (
                        <p className="text-muted-foreground mt-0.5 text-sm">
                          조치: {r.action}
                        </p>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
