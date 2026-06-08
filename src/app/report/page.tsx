"use client"

import Link from "next/link"
import { ListChecks } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/layout/page-header"
import { ReportForm } from "@/components/report/report-form"

export default function ReportPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <PageHeader />
      <main className="flex-1">
        <div className="container mx-auto max-w-3xl px-4 py-12 md:px-6">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                고장 보고 입력
              </h1>
              <p className="text-muted-foreground mt-2">
                현장 고장과 조치 내용을 직접 입력하거나, 기존 보고서를 업로드해
                데이터로 모읍니다.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/report/list">
                <ListChecks className="mr-1 h-4 w-4" />
                누적된 고장 보고
              </Link>
            </Button>
          </div>

          <ReportForm />
        </div>
      </main>
    </div>
  )
}
