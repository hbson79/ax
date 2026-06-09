"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import {
  Loader2,
  RefreshCw,
  ArrowLeft,
  Merge,
  Copy,
  Clock,
  ShieldAlert,
  CheckCircle2,
  Link2,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/layout/page-header"
import { formatDateTime } from "@/lib/utils"
import type { DuplicatePair, WikiLintResult } from "@/types"

export default function WikiLintPage() {
  const [result, setResult] = useState<WikiLintResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mergingKey, setMergingKey] = useState<string | null>(null)
  const [isLinking, setIsLinking] = useState(false)

  const runLint = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/wiki/lint")
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResult(data)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "점검에 실패했습니다."
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    runLint()
  }, [runLint])

  const handleCrosslink = async () => {
    setIsLinking(true)
    try {
      const res = await fetch("/api/wiki/crosslink", { method: "POST" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success(
        `관련 문서 연결 완료 (${data.linked}/${data.total}건 연결됨)`
      )
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "연결 실패")
    } finally {
      setIsLinking(false)
    }
  }

  const handleMerge = async (pair: DuplicatePair) => {
    // 근거 사례가 더 많은 쪽을 남기고, 적은 쪽을 통합·삭제
    const keepId = pair.a_cases >= pair.b_cases ? pair.a_id : pair.b_id
    const dropId = keepId === pair.a_id ? pair.b_id : pair.a_id
    const key = `${pair.a_id}-${pair.b_id}`
    setMergingKey(key)
    try {
      const res = await fetch("/api/wiki/lint/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keepId, dropId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success(`"${data.wiki.title}"로 통합했습니다.`)
      await runLint()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "통합 실패")
    } finally {
      setMergingKey(null)
    }
  }

  const isClean =
    result &&
    result.duplicates.length === 0 &&
    result.stale.length === 0 &&
    result.lowConfidence.length === 0

  return (
    <div className="flex min-h-screen flex-col">
      <PageHeader />
      <main className="flex-1">
        <div className="container mx-auto max-w-3xl px-4 py-12 md:px-6">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                위키 건강 점검
              </h1>
              <p className="text-muted-foreground mt-2">
                중복·노후·근거 부족 문서를 찾아 위키를 깨끗하게 유지합니다.
                {result && ` (전체 ${result.total}건)`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/wiki">
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  위키로
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCrosslink}
                disabled={isLinking}
                title="모든 위키에 의미적으로 가까운 관련 문서를 연결합니다"
              >
                {isLinking ? (
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                ) : (
                  <Link2 className="mr-1 h-4 w-4" />
                )}
                관련 문서 연결
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={runLint}
                disabled={isLoading}
              >
                <RefreshCw
                  className={`mr-1 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                />
                다시 점검
              </Button>
            </div>
          </div>

          {isLoading ? (
            <p className="text-muted-foreground py-12 text-center text-sm">
              점검 중...
            </p>
          ) : !result ? null : isClean ? (
            <div className="text-muted-foreground flex flex-col items-center gap-3 py-16 text-center">
              <CheckCircle2 className="text-primary h-12 w-12" />
              <p className="text-sm">
                점검 결과 이상 없습니다. 위키가 깨끗합니다.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* 중복 의심 쌍 */}
              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <Copy className="h-5 w-5" />
                  <h2 className="text-xl font-bold">중복 의심</h2>
                  <Badge variant="secondary">{result.duplicates.length}</Badge>
                </div>
                {result.duplicates.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    중복 의심 문서가 없습니다.
                  </p>
                ) : (
                  result.duplicates.map((pair) => {
                    const key = `${pair.a_id}-${pair.b_id}`
                    const merging = mergingKey === key
                    return (
                      <Card key={key}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between gap-2">
                            <CardTitle className="text-base">
                              유사도 {Math.round(pair.similarity * 100)}%
                            </CardTitle>
                            <Button
                              size="sm"
                              onClick={() => handleMerge(pair)}
                              disabled={merging}
                            >
                              {merging ? (
                                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                              ) : (
                                <Merge className="mr-1 h-4 w-4" />
                              )}
                              하나로 통합
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="grid gap-2 sm:grid-cols-2">
                          {[
                            {
                              title: pair.a_title,
                              cat: pair.a_category,
                              cases: pair.a_cases,
                            },
                            {
                              title: pair.b_title,
                              cat: pair.b_category,
                              cases: pair.b_cases,
                            },
                          ].map((d, i) => (
                            <div
                              key={i}
                              className="border-border rounded-md border p-3"
                            >
                              <p className="text-sm font-medium">{d.title}</p>
                              <div className="mt-1 flex flex-wrap gap-1.5">
                                {d.cat && (
                                  <Badge variant="outline">{d.cat}</Badge>
                                )}
                                <Badge variant="outline">
                                  근거 {d.cases}건
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    )
                  })
                )}
              </section>

              {/* 노후 문서 */}
              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <h2 className="text-xl font-bold">오래된 문서</h2>
                  <Badge variant="secondary">{result.stale.length}</Badge>
                </div>
                {result.stale.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    오래된 문서가 없습니다.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {result.stale.map((w) => (
                      <Card key={w.id} className="p-3">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium">{w.title}</p>
                          <span className="text-muted-foreground text-xs">
                            {formatDateTime(w.updated_at)} 갱신
                          </span>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </section>

              {/* 근거 부족 문서 */}
              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5" />
                  <h2 className="text-xl font-bold">근거 부족</h2>
                  <Badge variant="secondary">
                    {result.lowConfidence.length}
                  </Badge>
                </div>
                {result.lowConfidence.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    근거가 부족한 문서가 없습니다.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {result.lowConfidence.map((w) => (
                      <Card key={w.id} className="p-3">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium">{w.title}</p>
                          <Badge variant="destructive">
                            근거 {w.source_report_ids?.length ?? 0}건
                          </Badge>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
