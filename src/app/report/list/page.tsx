"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Loader2, Sparkles, RefreshCw, Plus, Search } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PageHeader } from "@/components/layout/page-header"
import { ReportCard } from "@/components/report/report-card"
import type { RawReport } from "@/types"

export default function ReportListPage() {
  const [reports, setReports] = useState<RawReport[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [keyword, setKeyword] = useState("")

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

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase()
    if (!kw) return reports
    return reports.filter((r) =>
      [r.line, r.train_no, r.symptom, r.action, r.result]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(kw))
    )
  }, [reports, keyword])

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
      toast.success(
        data.merged
          ? `기존 위키 "${data.wiki.title}"에 보강되었습니다.`
          : `위키 문서 "${data.wiki.title}"가 생성되었습니다.`
      )
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
          <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                누적된 고장 보고
              </h1>
              <p className="text-muted-foreground mt-2">
                모인 고장 보고를 관리하고, 선택해 학습 위키로 만듭니다.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/report">
                <Plus className="mr-1 h-4 w-4" />
                고장 보고 입력
              </Link>
            </Button>
          </div>

          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="호선·차량번호·증상 검색"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="pl-9"
              />
            </div>
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
            <div className="py-12 text-center">
              <p className="text-muted-foreground text-sm">
                아직 등록된 고장 보고가 없습니다.
              </p>
              <Button asChild variant="outline" className="mt-4">
                <Link href="/report">고장 보고 입력하러 가기</Link>
              </Button>
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center text-sm">
              검색 조건에 맞는 고장 보고가 없습니다.
            </p>
          ) : (
            <div className="space-y-2">
              {filtered.map((r) => (
                <ReportCard
                  key={r.id}
                  report={r}
                  checked={r.id ? selected.has(r.id) : false}
                  onToggle={() => r.id && toggle(r.id)}
                  onUpdated={(updated) =>
                    setReports((prev) =>
                      prev.map((d) => (d.id === updated.id ? updated : d))
                    )
                  }
                  onDeleted={(id) => {
                    setReports((prev) => prev.filter((d) => d.id !== id))
                    setSelected((prev) => {
                      const next = new Set(prev)
                      next.delete(id)
                      return next
                    })
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
