"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Mail } from "lucide-react"
import { RuleConflictPanel } from "@/components/admin/rule-conflict-panel"

export default function ConflictPage() {
  const [selectedConflict, setSelectedConflict] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <main className="flex-1 container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 space-y-6 sm:space-y-8">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Rule Conflicts</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Monitor and manage conflicting rulesets from different experts with same premises but different conclusions
          </p>
        </div>

        <div className="grid gap-4 sm:gap-6">
          <Card className="border-amber-200 bg-amber-50/50">
            <CardHeader className="pb-3">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <CardTitle className="text-lg text-amber-900">Active Conflicts Detected</CardTitle>
                  <CardDescription className="text-amber-800">
                    {3} rulesets with conflicting conclusions found
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <RuleConflictPanel />
        </div>
      </main>
    </div>
  )
}
