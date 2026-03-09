"use client"

import { useState } from "react"
import { Copy, Check, Calendar, Utensils } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
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
  const [copied, setCopied] = useState(false)
  const [viewMode, setViewMode] = useState<"table" | "json">("table")

  const handleCopy = async () => {
    await navigator.clipboard.writeText(JSON.stringify(data, null, 2))
    setCopied(true)
    toast.success("JSON이 클립보드에 복사되었습니다.")
    setTimeout(() => setCopied(false), 2000)
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
        <div className="flex gap-2">
          <Button
            variant={viewMode === "table" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("table")}
          >
            테이블
          </Button>
          <Button
            variant={viewMode === "json" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("json")}
          >
            JSON
          </Button>
        </div>
      </div>

      {viewMode === "table" ? (
        <div className="grid gap-3">
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
      ) : (
        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="absolute top-3 right-3"
          >
            {copied ? (
              <Check className="mr-1 h-3.5 w-3.5" />
            ) : (
              <Copy className="mr-1 h-3.5 w-3.5" />
            )}
            {copied ? "복사됨" : "복사"}
          </Button>
          <pre className="bg-muted text-foreground overflow-x-auto rounded-xl p-4 text-sm">
            <code>{JSON.stringify(data, null, 2)}</code>
          </pre>
        </div>
      )}
    </div>
  )
}
