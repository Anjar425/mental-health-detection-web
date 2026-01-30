"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mail, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react"
import { RuleConflictDetail } from "./rule-conflict-detail"

interface Expert {
  id: number
  name: string
  email: string
  specialty: string
}

interface Premise {
  questionId: string
  severity: "Low" | "Medium" | "High"
  prefix?: string
}

interface RuleConflict {
  id: number
  premises: Premise[]
  conflictingRules: {
    expertId: number
    expertName: string
    expertEmail: string
    conclusion: {
      category: "Anxiety" | "Depression" | "Stress"
      severity: string
    }
  }[]
  conflictCount: number
}

// Dummy data untuk demo
const DUMMY_CONFLICTS: RuleConflict[] = [
  {
    id: 1,
    premises: [
      { questionId: "Q13", severity: "Low" },
      { questionId: "Q17", severity: "Low" },
      { questionId: "Q38", severity: "Low" }
    ],
    conflictingRules: [
      {
        expertId: 1,
        expertName: "Dr. Ahmad Suryanto",
        expertEmail: "ahmad.suryanto@example.com",
        conclusion: {
          category: "Depression",
          severity: "Mild"
        }
      },
      {
        expertId: 2,
        expertName: "Prof. Siti Nurhaliza",
        expertEmail: "siti.nurhaliza@example.com",
        conclusion: {
          category: "Depression",
          severity: "Moderate"
        }
      },
      {
        expertId: 3,
        expertName: "Dr. Budi Santoso",
        expertEmail: "budi.santoso@example.com",
        conclusion: {
          category: "Anxiety",
          severity: "Mild"
        }
      }
    ],
    conflictCount: 3
  },
  {
    id: 2,
    premises: [
      { questionId: "Q1", severity: "Medium" },
      { questionId: "Q5", severity: "Medium" },
      { questionId: "Q9", severity: "High" }
    ],
    conflictingRules: [
      {
        expertId: 1,
        expertName: "Dr. Ahmad Suryanto",
        expertEmail: "ahmad.suryanto@example.com",
        conclusion: {
          category: "Anxiety",
          severity: "Severe"
        }
      },
      {
        expertId: 4,
        expertName: "Dr. Ratna Wijaya",
        expertEmail: "ratna.wijaya@example.com",
        conclusion: {
          category: "Stress",
          severity: "Moderate"
        }
      }
    ],
    conflictCount: 2
  },
  {
    id: 3,
    premises: [
      { questionId: "Q2", severity: "High" },
      { questionId: "Q6", severity: "High" },
      { questionId: "Q10", severity: "High" },
      { questionId: "Q14", severity: "Medium" }
    ],
    conflictingRules: [
      {
        expertId: 2,
        expertName: "Prof. Siti Nurhaliza",
        expertEmail: "siti.nurhaliza@example.com",
        conclusion: {
          category: "Stress",
          severity: "Extreme"
        }
      },
      {
        expertId: 3,
        expertName: "Dr. Budi Santoso",
        expertEmail: "budi.santoso@example.com",
        conclusion: {
          category: "Anxiety",
          severity: "Extreme"
        }
      },
      {
        expertId: 5,
        expertName: "Dr. Eka Prasetya",
        expertEmail: "eka.prasetya@example.com",
        conclusion: {
          category: "Depression",
          severity: "Severe"
        }
      }
    ],
    conflictCount: 3
  }
]

const SEVERITY_COLORS = {
  Normal: "bg-green-100 text-green-800",
  Mild: "bg-blue-100 text-blue-800",
  Moderate: "bg-yellow-100 text-yellow-800",
  Severe: "bg-orange-100 text-orange-800",
  Extreme: "bg-red-100 text-red-800"
}

const CATEGORY_COLORS = {
  Depression: "bg-purple-100 text-purple-800",
  Anxiety: "bg-red-100 text-red-800",
  Stress: "bg-amber-100 text-amber-800"
}

export function RuleConflictPanel() {
  const [expandedConflict, setExpandedConflict] = useState<number | null>(null)

  const toggleExpand = (conflictId: number) => {
    setExpandedConflict(expandedConflict === conflictId ? null : conflictId)
  }

  const handleContactExpert = (expert: { name: string; email: string }) => {
    const subject = encodeURIComponent("Rule Conflict Resolution - MindCare System")
    const body = encodeURIComponent(
      `Dear ${expert.name},\n\nWe have detected a conflict in one of your rulesets with premises that match rules from other experts, but with different conclusions.\n\nPlease review and coordinate with other experts to ensure consistency.\n\nBest regards,\nMindCare Admin Team`
    )
    window.location.href = `mailto:${expert.email}?subject=${subject}&body=${body}`
  }

  return (
    <div className="space-y-4">
      {DUMMY_CONFLICTS.map((conflict) => (
        <Card key={conflict.id} className="overflow-hidden">
          <CardHeader className="pb-3 cursor-pointer" onClick={() => toggleExpand(conflict.id)}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <CardTitle className="text-base">
                    Premise Pattern {conflict.id}
                  </CardTitle>
                  <Badge variant="destructive" className="text-xs">
                    {conflict.conflictCount} Conflicts
                  </Badge>
                </div>
                <CardDescription className="text-xs sm:text-sm">
                  {conflict.premises.map((p) => `${p.questionId} (${p.severity})`).join(" AND ")}
                </CardDescription>
              </div>
              <div className="flex-shrink-0">
                {expandedConflict === conflict.id ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </div>
          </CardHeader>

          {expandedConflict === conflict.id && (
            <CardContent className="space-y-4 border-t border-border pt-4">
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">Conflicting Conclusions:</p>
                
                {conflict.conflictingRules.map((rule, index) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 bg-muted/30 rounded-lg border border-border/50"
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">{rule.expertName}</span>
                        <Badge className={CATEGORY_COLORS[rule.conclusion.category]} variant="outline">
                          {rule.conclusion.category}
                        </Badge>
                        <Badge
                          className={SEVERITY_COLORS[rule.conclusion.severity as keyof typeof SEVERITY_COLORS]}
                          variant="outline"
                        >
                          {rule.conclusion.severity}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{rule.expertEmail}</p>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full sm:w-auto gap-2"
                      onClick={() => handleContactExpert({ name: rule.expertName, email: rule.expertEmail })}
                    >
                      <Mail className="h-4 w-4" />
                      <span className="text-xs">Contact</span>
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-2 border-t border-border/50">
                <Button size="sm" variant="outline" className="flex-1">
                  View Full Rules
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  Merge Resolution
                </Button>
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  )
}
