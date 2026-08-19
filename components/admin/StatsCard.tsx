import React from "react"

export default function StatsCard({ title, value }: { title: string; value: number | string }) {
  return (
    <div className="p-4 border rounded bg-card">
      <div className="text-sm text-muted-foreground">{title}</div>
      <div className="text-2xl font-bold mt-2">{value}</div>
    </div>
  )
}
