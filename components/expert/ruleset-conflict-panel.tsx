"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Mail } from "lucide-react"

interface Premise {
  questionnaire: string
  severity: string
  prefix: string
  conjunction: string
}

interface RulesetItem {
  expert_id: string
  expert_name: string
  expert_email: string
  premises: Premise[]
  conclusion: {
    category: string
    severity: string
  }
}

interface ConflictGroup {
  premiseKey: string
  premise: Premise[]
  formattedPremise: string
  experts: {
    name: string
    email: string
    conclusion: {
      category: string
      severity: string
    }
  }[]
}

// Dummy data DASS-42 rulesets dari berbagai pakar
const DUMMY_RULESETS: RulesetItem[] = [
  {
    expert_id: "exp_001",
    expert_name: "Dr. Ahmad Wijaya",
    expert_email: "ahmad.wijaya@example.com",
    premises: [
      { questionnaire: "Q13", severity: "Low", prefix: "No Prefix", conjunction: "AND" },
      { questionnaire: "Q17", severity: "Low", prefix: "No Prefix", conjunction: "AND" },
      { questionnaire: "Q38", severity: "Low", prefix: "No Prefix", conjunction: "THEN" },
    ],
    conclusion: {
      category: "Depression",
      severity: "Normal",
    },
  },
  {
    expert_id: "exp_002",
    expert_name: "Dr. Siti Nurhaliza",
    expert_email: "siti.nurhaliza@example.com",
    premises: [
      { questionnaire: "Q13", severity: "Low", prefix: "No Prefix", conjunction: "AND" },
      { questionnaire: "Q17", severity: "Low", prefix: "No Prefix", conjunction: "AND" },
      { questionnaire: "Q38", severity: "Low", prefix: "No Prefix", conjunction: "THEN" },
    ],
    conclusion: {
      category: "Depression",
      severity: "Mild",
    },
  },
  {
    expert_id: "exp_003",
    expert_name: "Dr. Budi Santoso",
    expert_email: "budi.santoso@example.com",
    premises: [
      { questionnaire: "Q13", severity: "Low", prefix: "No Prefix", conjunction: "AND" },
      { questionnaire: "Q17", severity: "Low", prefix: "No Prefix", conjunction: "AND" },
      { questionnaire: "Q38", severity: "Low", prefix: "No Prefix", conjunction: "THEN" },
    ],
    conclusion: {
      category: "Depression",
      severity: "Moderate",
    },
  },
  {
    expert_id: "exp_004",
    expert_name: "Dr. Rina Kusuma",
    expert_email: "rina.kusuma@example.com",
    premises: [
      { questionnaire: "Q2", severity: "Medium", prefix: "No Prefix", conjunction: "AND" },
      { questionnaire: "Q19", severity: "Medium", prefix: "No Prefix", conjunction: "AND" },
      { questionnaire: "Q37", severity: "High", prefix: "No Prefix", conjunction: "THEN" },
    ],
    conclusion: {
      category: "Anxiety",
      severity: "Severe",
    },
  },
  {
    expert_id: "exp_005",
    expert_name: "Dr. Hendra Setiawan",
    expert_email: "hendra.setiawan@example.com",
    premises: [
      { questionnaire: "Q2", severity: "Medium", prefix: "No Prefix", conjunction: "AND" },
      { questionnaire: "Q19", severity: "Medium", prefix: "No Prefix", conjunction: "AND" },
      { questionnaire: "Q37", severity: "High", prefix: "No Prefix", conjunction: "THEN" },
    ],
    conclusion: {
      category: "Anxiety",
      severity: "Extreme",
    },
  },
]

function generatePremiseKey(premises: Premise[]): string {
  return premises
    .map((p) => `${p.questionnaire}:${p.severity}:${p.prefix}`)
    .join("|")
}

function formatPremiseText(premises: Premise[]): string {
  return premises
    .map((p) => {
      const prefix = p.prefix !== "No Prefix" ? `${p.prefix} ` : ""
      return `${p.questionnaire} (${p.severity})`
    })
    .join(` ${premises[0]?.conjunction || "AND"} `)
}

function detectConflicts(rulesets: RulesetItem[]): ConflictGroup[] {
  const grouped: Record<string, ConflictGroup> = {}

  rulesets.forEach((ruleset) => {
    const key = generatePremiseKey(ruleset.premises)

    if (!grouped[key]) {
      grouped[key] = {
        premiseKey: key,
        premise: ruleset.premises,
        formattedPremise: formatPremiseText(ruleset.premises),
        experts: [],
      }
    }

    grouped[key].experts.push({
      name: ruleset.expert_name,
      email: ruleset.expert_email,
      conclusion: ruleset.conclusion,
    })
  })

  // Filter hanya yang memiliki lebih dari 1 expert (conflict)
  return Object.values(grouped).filter((group) => group.experts.length > 1)
}

export function RulesetConflictPanel() {
  const [selectedConflict, setSelectedConflict] = useState<string | null>(null)

  const conflicts = useMemo(() => {
    return detectConflicts(DUMMY_RULESETS)
  }, [])

  const handleContactExpert = (email: string) => {
    window.location.href = `mailto:${email}?subject=Penyesuaian Ruleset DASS-42&body=Halo,\n\nSaya ingin mendiskusikan penyesuaian ruleset DASS-42 yang Anda buat.\n\nMohon hubungi kembali untuk koordinasi lebih lanjut.\n\nTerima kasih.`
  }

  if (conflicts.length === 0) {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Deteksi Konflik Ruleset
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Analisis ruleset DASS-42 dari berbagai pakar untuk menemukan premis yang sama dengan konklusi berbeda
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">Tidak ada konflik ruleset ditemukan. Semua pakar konsisten dalam membuat keputusan.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          Deteksi Konflik Ruleset
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Ditemukan {conflicts.length} kelompok ruleset dengan premis sama namun konklusi berbeda
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {conflicts.map((conflict, idx) => (
          <div
            key={conflict.premiseKey}
            className="border border-red-200 bg-red-50 rounded-lg p-4 space-y-3"
          >
            {/* Premis Section */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Premis (Kondisi)</p>
              <div className="bg-white border border-red-100 rounded p-3 font-mono text-xs text-gray-800 break-words">
                {conflict.formattedPremise}
              </div>
            </div>

            {/* Experts dengan Konklusi Berbeda */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Hasil (Konklusi) - Pakar</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {conflict.experts.map((expert, expIdx) => (
                  <div key={expIdx} className="bg-white border border-red-100 rounded p-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-900">{expert.name}</p>
                        <p className="text-[10px] text-gray-600 break-all">{expert.email}</p>
                      </div>
                    </div>

                    {/* Conclusion Badges */}
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="secondary" className="text-xs">
                        {expert.conclusion.category}
                      </Badge>
                      <Badge
                        variant="default"
                        className={`text-xs ${
                          expert.conclusion.severity === "Normal"
                            ? "bg-green-600"
                            : expert.conclusion.severity === "Mild"
                              ? "bg-blue-600"
                              : expert.conclusion.severity === "Moderate"
                                ? "bg-yellow-600"
                                : expert.conclusion.severity === "Severe"
                                  ? "bg-orange-600"
                                  : "bg-red-600"
                        }`}
                      >
                        {expert.conclusion.severity}
                      </Badge>
                    </div>

                    {/* Contact Button */}
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full text-xs h-8 gap-1.5"
                      onClick={() => handleContactExpert(expert.email)}
                    >
                      <Mail className="w-3.5 h-3.5" />
                      Hubungi Pakar
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
