"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  Loader2,
  Sparkles,
  RefreshCw,
  Plus,
  Search,
  ArrowUp,
  ArrowDown,
  Wand2,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PageHeader } from "@/components/layout/page-header"
import { ReportCard } from "@/components/report/report-card"
import type { RawReport } from "@/types"

type SortField = "none" | "occurred_at" | "line"
type SortDir = "asc" | "desc"

interface SortRule {
  field: SortField
  dir: SortDir
}

const SORT_FIELD_LABEL: Record<SortField, string> = {
  none: "없음",
  occurred_at: "발생일시",
  line: "호선",
}

// 한 기준으로 두 보고를 비교(값 없는 항목은 항상 뒤로). 정렬 방향 미적용 raw 결과.
function compareByField(
  a: RawReport,
  b: RawReport,
  field: Exclude<SortField, "none">
): number {
  const av = a[field]
  const bv = b[field]
  if (!av && !bv) return 0
  if (!av) return 1
  if (!bv) return -1
  return field === "occurred_at"
    ? av.localeCompare(bv)
    : av.localeCompare(bv, "ko", { numeric: true })
}

export default function ReportListPage() {
  const [reports, setReports] = useState<RawReport[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isIngesting, setIsIngesting] = useState(false)
  const [pending, setPending] = useState(0)
  const [keyword, setKeyword] = useState("")
  // [1차, 2차] 다단 정렬: 호선으로 묶고 그 안에서 발생일시순 등이 가능
  const [sortRules, setSortRules] = useState<[SortRule, SortRule]>([
    { field: "line", dir: "asc" },
    { field: "occurred_at", dir: "desc" },
  ])

  const setRule = (idx: 0 | 1, patch: Partial<SortRule>) =>
    setSortRules((prev) => {
      const next: [SortRule, SortRule] = [{ ...prev[0] }, { ...prev[1] }]
      next[idx] = { ...next[idx], ...patch }
      // 1·2차가 같은 기준이면 중복이므로 2차를 비활성화
      if (next[0].field !== "none" && next[0].field === next[1].field) {
        next[idx === 0 ? 1 : 0].field = "none"
      }
      return next
    })

  const loadReports = useCallback(async () => {
    setIsLoading(true)
    try {
      const [reportsRes, pendingRes] = await Promise.all([
        fetch("/api/reports"),
        fetch("/api/wiki/ingest"),
      ])
      const data = await reportsRes.json()
      if (!reportsRes.ok) throw new Error(data.error)
      setReports(data.reports ?? [])
      const p = await pendingRes.json()
      setPending(p.pending ?? 0)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "목록을 불러오지 못했습니다."
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleIngest = async () => {
    setIsIngesting(true)
    try {
      const res = await fetch("/api/wiki/ingest", { method: "POST" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      if (data.processed === 0) {
        toast.info("자동 정리할 미처리 보고가 없습니다.")
      } else {
        toast.success(
          `${data.processed}건 정리 완료 (신규 ${data.created} · 보강 ${data.merged}, 남음 ${data.remaining})`
        )
      }
      await loadReports()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "자동 정리 실패")
    } finally {
      setIsIngesting(false)
    }
  }

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
    const list = kw
      ? reports.filter((r) =>
          [r.line, r.train_no, r.symptom, r.action, r.result]
            .filter(Boolean)
            .some((v) => v!.toLowerCase().includes(kw))
        )
      : reports

    const activeRules = sortRules.filter((r) => r.field !== "none")
    if (activeRules.length === 0) return list

    return [...list].sort((a, b) => {
      for (const rule of activeRules) {
        const cmp = compareByField(
          a,
          b,
          rule.field as Exclude<SortField, "none">
        )
        if (cmp !== 0) return rule.dir === "asc" ? cmp : -cmp
      }
      return 0
    })
  }, [reports, keyword, sortRules])

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
                variant="secondary"
                size="sm"
                onClick={handleIngest}
                disabled={isIngesting || pending === 0}
                title="미처리 보고를 AI가 자동으로 분류·병합합니다"
              >
                {isIngesting ? (
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="mr-1 h-4 w-4" />
                )}
                자동 정리 ({pending})
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

          {/* 정렬 (1차 → 2차 다단) */}
          <div className="mb-4 space-y-2">
            {([0, 1] as const).map((idx) => {
              const rule = sortRules[idx]
              const other = sortRules[idx === 0 ? 1 : 0]
              return (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-muted-foreground w-10 text-sm">
                    {idx === 0 ? "1차" : "2차"}
                  </span>
                  <Select
                    value={rule.field}
                    onValueChange={(v) =>
                      setRule(idx, { field: v as SortField })
                    }
                  >
                    <SelectTrigger size="sm" className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">없음</SelectItem>
                      {(["occurred_at", "line"] as const).map((f) => (
                        <SelectItem
                          key={f}
                          value={f}
                          // 다른 행이 이미 쓰는 기준은 중복 선택 방지
                          disabled={other.field === f}
                        >
                          {SORT_FIELD_LABEL[f]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={rule.field === "none"}
                    onClick={() =>
                      setRule(idx, {
                        dir: rule.dir === "asc" ? "desc" : "asc",
                      })
                    }
                  >
                    {rule.dir === "asc" ? (
                      <>
                        <ArrowUp className="mr-1 h-4 w-4" />
                        오름차순
                      </>
                    ) : (
                      <>
                        <ArrowDown className="mr-1 h-4 w-4" />
                        내림차순
                      </>
                    )}
                  </Button>
                </div>
              )
            })}
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
