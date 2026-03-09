"use client"

import { useRef } from "react"
import { Calendar, Utensils, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import html2canvas from "html2canvas"
import type { CafeteriaMenuResult } from "@/types"

interface MenuResultProps {
  data: CafeteriaMenuResult
}

const mealLabels: Record<string, string> = {
  breakfast: "조식",
  lunch: "중식",
  dinner: "석식",
}

const mealColors: Record<string, string> = {
  breakfast:
    "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  lunch: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  dinner:
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
}

export function MenuResult({ data }: MenuResultProps) {
  const tableRef = useRef<HTMLDivElement>(null)

  const handleDownload = async () => {
    if (!tableRef.current) return

    try {
      const canvas = await html2canvas(tableRef.current, {
        backgroundColor: null,
        scale: 2,
      })

      canvas.toBlob((blob) => {
        if (!blob) return
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${data.cafeteria_name}_${data.start_date}.png`
        a.click()
        URL.revokeObjectURL(url)
      }, "image/png")

      toast.success("이미지가 다운로드되었습니다.")
    } catch {
      toast.error("다운로드에 실패했습니다.")
    }
  }

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-foreground flex items-center gap-2 text-xl font-bold">
            <Utensils className="h-5 w-5" />
            {data.cafeteria_name}
          </h2>
          <p className="text-muted-foreground mt-1 flex items-center gap-1 text-sm">
            <Calendar className="h-3.5 w-3.5" />
            {data.start_date} ~ {data.end_date}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleDownload}>
          <Download className="mr-1 h-4 w-4" />
          다운로드
        </Button>
      </div>

      {/* 테이블 (캡처 대상) */}
      <div ref={tableRef} className="grid gap-3">
        {data.weekly_menus.map((day) => (
          <Card key={day.date}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Badge variant="secondary">{day.day_of_week}</Badge>
                {day.date}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 sm:grid-cols-3">
              {(Object.keys(day.meals) as Array<keyof typeof day.meals>).map(
                (mealType) => {
                  const items = day.meals[mealType]
                  if (!items || items.length === 0) return null
                  return (
                    <div key={mealType} className="space-y-1.5">
                      <span
                        className={`inline-block rounded-md px-2 py-0.5 text-xs font-medium ${mealColors[mealType] || ""}`}
                      >
                        {mealLabels[mealType] || mealType}
                      </span>
                      <ul className="space-y-0.5">
                        {items.map((item, i) => (
                          <li key={i} className="text-foreground text-sm">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                }
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
