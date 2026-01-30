"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Mail, Eye, Merge2, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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

interface MergeState {
  conflictKey: string
  selectedExpertIndex: number | null
  mergeNotes: string
}

export function RulesetConflictPanel() {
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [viewModalData, setViewModalData] = useState<ConflictGroup | null>(null)
  const [mergeDialogOpen, setMergeDialogOpen] = useState(false)
  const [mergeState, setMergeState] = useState<MergeState | null>(null)
  const [mergedConflicts, setMergedConflicts] = useState<Set<string>>(new Set())

  const conflicts = useMemo(() => {
    return detectConflicts(DUMMY_RULESETS)
  }, [])

  const handleContactExpert = (email: string) => {
    window.location.href = `mailto:${email}?subject=Penyesuaian Ruleset DASS-42&body=Halo,\n\nSaya ingin mendiskusikan penyesuaian ruleset DASS-42 yang Anda buat.\n\nMohon hubungi kembali untuk koordinasi lebih lanjut.\n\nTerima kasih.`
  }

  const handleViewFullRule = (conflict: ConflictGroup) => {
    setViewModalData(conflict)
    setViewModalOpen(true)
  }

  const handleOpenMergeDialog = (conflictKey: string) => {
    setMergeState({
      conflictKey,
      selectedExpertIndex: null,
      mergeNotes: "",
    })
    setMergeDialogOpen(true)
  }

  const handleMergeSolution = () => {
    if (mergeState && mergeState.selectedExpertIndex !== null) {
      setMergedConflicts((prev) => new Set([...prev, mergeState.conflictKey]))
      setMergeDialogOpen(false)
      setMergeState(null)
    }
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

  const filteredConflicts = Array.from(conflicts).filter(
    (c) => !mergedConflicts.has(c.premiseKey)
  )

  return (
    <>
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            Deteksi Konflik Ruleset
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Ditemukan {filteredConflicts.length} kelompok ruleset dengan premis sama namun konklusi berbeda
            {mergedConflicts.size > 0 && ` · ${mergedConflicts.size} sudah terselesaikan`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
        {filteredConflicts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">Semua konflik ruleset sudah terselesaikan!</p>
          </div>
        ) : (
          filteredConflicts.map((conflict, idx) => (
          <div
            key={conflict.premiseKey}
            className="border border-red-200 bg-red-50 rounded-lg p-4 space-y-3"
          >
            {/* Header with Action Buttons */}
            <div className="flex items-start justify-between gap-2 pb-2 border-b border-red-200">
              <div>
                <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Kelompok Konflik {idx + 1}
                </p>
              </div>
              <div className="flex gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs gap-1"
                  onClick={() => handleViewFullRule(conflict)}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Lihat Detail</span>
                </Button>
                <Button
                  size="sm"
                  className="h-8 text-xs gap-1 bg-blue-600 hover:bg-blue-700"
                  onClick={() => handleOpenMergeDialog(conflict.premiseKey)}
                  disabled={mergedConflicts.has(conflict.premiseKey)}
                >
                  <Merge2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">
                    {mergedConflicts.has(conflict.premiseKey) ? "Terselesaikan" : "Gabungkan"}
                  </span>
                </Button>
              </div>
            </div>

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
        ))
        )}
      </CardContent>
    </Card>

    {/* Modal: View Full Rules Detail */}
    <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detail Lengkap Ruleset Konflik</DialogTitle>
          <DialogDescription>
            Informasi lengkap tentang premis dan konklusi dari setiap pakar
          </DialogDescription>
        </DialogHeader>

        {viewModalData && (
          <div className="space-y-6 mt-4">
            {/* Premise Section */}
            <div className="space-y-3">
              <div>
                <p className="font-semibold text-sm mb-2">Premis (Kondisi) - Sama untuk Semua Pakar</p>
                <div className="bg-slate-100 border border-slate-300 rounded-lg p-4 font-mono text-sm space-y-2">
                  {viewModalData.premise.map((prem, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <span className="text-blue-600 font-semibold">{prem.questionnaire}</span>
                      <span className="text-gray-600">({prem.severity})</span>
                      {idx < viewModalData.premise.length - 1 && (
                        <span className="text-gray-500 font-semibold">{prem.conjunction}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Conclusion Section */}
            <div className="space-y-3">
              <p className="font-semibold text-sm">Konklusi (Hasil) - Berbeda antar Pakar</p>
              <div className="grid grid-cols-1 gap-3">
                {viewModalData.experts.map((expert, idx) => (
                  <div
                    key={idx}
                    className="border border-slate-200 rounded-lg p-4 space-y-2 bg-slate-50"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-sm">{expert.name}</p>
                        <p className="text-xs text-gray-600">{expert.email}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge
                          variant="secondary"
                          className="text-xs"
                        >
                          {expert.conclusion.category}
                        </Badge>
                        <Badge
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
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>

    {/* Modal: Merge Solution */}
    <Dialog open={mergeDialogOpen} onOpenChange={setMergeDialogOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Gabungkan Solusi Konflik</DialogTitle>
          <DialogDescription>
            Pilih konklusi mana yang akan digunakan sebagai ruleset final atau buat solusi kompromi
          </DialogDescription>
        </DialogHeader>

        {mergeState && viewModalData && (
          <div className="space-y-4 mt-4">
            {/* Premise Display */}
            <div className="bg-slate-100 rounded-lg p-3 space-y-2">
              <p className="text-xs font-semibold text-gray-700 uppercase">Premis Konflik</p>
              <div className="font-mono text-xs text-gray-800">
                {viewModalData.formattedPremise}
              </div>
            </div>

            {/* Expert Selection */}
            <div className="space-y-3">
              <p className="text-sm font-semibold">Pilih Konklusi yang Disetujui:</p>
              <RadioGroup
                value={
                  mergeState.selectedExpertIndex !== null
                    ? mergeState.selectedExpertIndex.toString()
                    : ""
                }
                onValueChange={(val) =>
                  setMergeState({
                    ...mergeState,
                    selectedExpertIndex: parseInt(val),
                  })
                }
              >
                <div className="space-y-2">
                  {viewModalData.experts.map((expert, idx) => (
                    <div key={idx} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-slate-50">
                      <RadioGroupItem value={idx.toString()} id={`expert-${idx}`} />
                      <Label
                        htmlFor={`expert-${idx}`}
                        className="flex-1 cursor-pointer"
                      >
                        <div className="font-medium text-sm">{expert.name}</div>
                        <div className="text-xs text-gray-600 flex gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {expert.conclusion.category}
                          </Badge>
                          <Badge className={`text-xs ${
                            expert.conclusion.severity === "Normal"
                              ? "bg-green-600"
                              : expert.conclusion.severity === "Mild"
                                ? "bg-blue-600"
                                : expert.conclusion.severity === "Moderate"
                                  ? "bg-yellow-600"
                                  : expert.conclusion.severity === "Severe"
                                    ? "bg-orange-600"
                                    : "bg-red-600"
                          }`}>
                            {expert.conclusion.severity}
                          </Badge>
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            {/* Notes Section */}
            <div className="space-y-2">
              <Label htmlFor="merge-notes" className="text-sm font-semibold">
                Catatan Penyelesaian (Opsional)
              </Label>
              <textarea
                id="merge-notes"
                placeholder="Masukkan alasan pemilihan konklusi ini atau catatan koordinasi dengan pakar..."
                className="w-full h-20 p-3 border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={mergeState.mergeNotes}
                onChange={(e) =>
                  setMergeState({
                    ...mergeState,
                    mergeNotes: e.target.value,
                  })
                }
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setMergeDialogOpen(false)
                  setMergeState(null)
                }}
              >
                Batal
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleMergeSolution}
                disabled={mergeState.selectedExpertIndex === null}
              >
                Simpan Solusi
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
    </>
  )
}
