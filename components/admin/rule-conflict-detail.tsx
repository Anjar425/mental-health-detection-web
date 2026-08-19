"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle } from "lucide-react"

interface ConflictDetailProps {
  conflictId: number
  premises: string[]
  conclusions: {
    expertName: string
    category: string
    severity: string
  }[]
}

export function RuleConflictDetail({ conflictId, premises, conclusions }: ConflictDetailProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            Conflict Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">Premises (Conditions):</p>
            <div className="space-y-2">
              {premises.map((premise, idx) => (
                <div key={idx} className="text-sm text-muted-foreground p-2 bg-muted/50 rounded">
                  {premise}
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Different Conclusions:</p>
            <div className="space-y-2">
              {conclusions.map((conclusion, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2 bg-muted/50 rounded text-sm"
                >
                  <span className="font-medium">{conclusion.expertName}:</span>
                  <Badge>{conclusion.category}</Badge>
                  <Badge variant="secondary">{conclusion.severity}</Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
