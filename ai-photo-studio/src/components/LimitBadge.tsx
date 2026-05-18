"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"

export function LimitBadge() {
  const [used, setUsed] = useState<number | null>(null)
  const limit = 50

  useEffect(() => {
    let cancelled = false
    fetch("/api/account")
      .then(async (r) => {
        if (!r.ok) throw new Error("not ok")
        return r.json()
      })
      .then((data) => {
        if (cancelled) return
        if (typeof data?.totalGenerations === "number") {
          setUsed(data.totalGenerations)
        }
      })
      .catch(() => {
        // API ещё не готов (шаг 9) — badge просто не показывается
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (used === null) return null

  const isNearLimit = used >= limit * 0.8
  const isAtLimit = used >= limit

  return (
    <Badge
      variant={isAtLimit ? "destructive" : isNearLimit ? "secondary" : "outline"}
      className="tabular-nums"
    >
      {used}/{limit}
    </Badge>
  )
}
