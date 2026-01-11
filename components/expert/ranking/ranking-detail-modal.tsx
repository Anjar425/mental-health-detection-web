"use client"

import { useEffect, useMemo, useState } from "react"
import { Award, BarChart3, LayoutGrid, Users, X } from "lucide-react"
import { jwtDecode } from "jwt-decode"

import type { GroupConsensusRow, GroupExpertRanking, GroupRankingDetail } from "@/services/admin"

interface ExpertRankingModalProps {
  open: boolean
  onClose: () => void
  groupName?: string
  groupDescription?: string | null
  loading: boolean
  error: string | null
  progressText: string
  detail: GroupRankingDetail | null
}

const renderCapability = (capability: GroupExpertRanking["capability"] | null | undefined) => {
  if (!capability) {
    return (
      <div className="bg-muted/20 border border-border rounded-lg p-2 sm:p-3 text-xs sm:text-sm text-muted-foreground">
        Tidak ada data kapabilitas tersedia.
      </div>
    )
  }

  return (
    <div className="bg-muted/40 border border-border rounded-lg p-2 sm:p-3 text-xs sm:text-sm grid grid-cols-2 gap-1.5 sm:gap-2">
      <div>
        <span className="text-muted-foreground text-[10px] sm:text-xs">Pendidikan</span>
        <p className="font-medium text-foreground truncate">{capability.education_level || "-"}</p>
      </div>
      <div>
        <span className="text-muted-foreground text-[10px] sm:text-xs">Publikasi</span>
        <p className="font-medium text-foreground">{capability.publication_count ?? 0}</p>
      </div>
      <div>
        <span className="text-muted-foreground text-[10px] sm:text-xs">Jumlah Pasien</span>
        <p className="font-medium text-foreground">{capability.patient_count ?? 0}</p>
      </div>
      <div>
        <span className="text-muted-foreground text-[10px] sm:text-xs">Pengalaman</span>
        <p className="font-medium text-foreground">{capability.flight_hours ?? 0} tahun</p>
      </div>
      <div>
        <span className="text-muted-foreground text-[10px] sm:text-xs">Bobot Pengalaman</span>
        <p className="font-medium text-foreground">{capability.weight_JT ?? 0}%</p>
      </div>
      <div>
        <span className="text-muted-foreground text-[10px] sm:text-xs">Bobot Pasien</span>
        <p className="font-medium text-foreground">{capability.weight_Pat ?? 0}%</p>
      </div>
      <div>
        <span className="text-muted-foreground text-[10px] sm:text-xs">Bobot Pendidikan</span>
        <p className="font-medium text-foreground">{capability.weight_Pend ?? 0}%</p>
      </div>
      <div>
        <span className="text-muted-foreground text-[10px] sm:text-xs">Bobot Publikasi</span>
        <p className="font-medium text-foreground">{capability.weight_Pub ?? 0}%</p>
      </div>
    </div>
  )
}

const renderPreferences = (preferences: GroupExpertRanking["preferences"] | null | undefined) => {
  if (!preferences || preferences.length === 0) {
    return (
      <div className="border border-border rounded-lg p-3 sm:p-4 text-xs sm:text-sm text-muted-foreground bg-muted/20">
        Preferensi DASS-21 tidak tersedia.
      </div>
    )
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="bg-muted/40 px-2 sm:px-3 py-1.5 sm:py-2 flex items-center gap-2 text-[10px] sm:text-xs uppercase tracking-wide text-muted-foreground">
        Preferensi DASS-21
      </div>
      <div className="max-h-40 sm:max-h-56 overflow-y-auto text-[10px] sm:text-xs">
        <table className="w-full">
          <thead className="bg-muted/40 sticky top-0 z-10">
            <tr className="text-muted-foreground">
              <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left w-12 sm:w-16">Soal</th>
              <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-right text-primary">Dep</th>
              <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-right text-secondary">Anx</th>
              <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-right text-destructive">Str</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {preferences.map((pref) => (
              <tr key={pref.question_id} className="hover:bg-muted/20">
                <td className="px-2 sm:px-3 py-1 font-mono text-muted-foreground">#{pref.question_id}</td>
                <td className="px-2 sm:px-3 py-1 text-right font-medium text-primary/80">{pref.depression.toFixed(1)}%</td>
                <td className="px-2 sm:px-3 py-1 text-right font-medium text-secondary/80">{pref.anxiety.toFixed(1)}%</td>
                <td className="px-2 sm:px-3 py-1 text-right font-medium text-destructive/80">{pref.stress.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const renderConsensusMatrix = (rows: GroupConsensusRow[], onClose: () => void) => (
  <div className="space-y-3 sm:space-y-4">
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
      <div>
        <h3 className="text-sm sm:text-lg font-semibold flex items-center gap-1.5 sm:gap-2">
          <LayoutGrid className="w-4 h-4 sm:w-5 sm:h-5 text-primary" /> Konsensus Matriks Akhir
        </h3>
        <p className="text-[10px] sm:text-xs text-muted-foreground">
          Nilai agregasi (Depression, Anxiety, Stress) per butir DASS-21.
        </p>
      </div>
      <button
        className="inline-flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm rounded-md bg-muted text-foreground hover:bg-muted/80"
        onClick={onClose}
      >
        <X className="w-3 h-3 sm:w-4 sm:h-4" /> Tutup
      </button>
    </div>

    <div className="border border-border rounded-xl overflow-hidden">
      <div className="max-h-[50vh] sm:max-h-[60vh] overflow-y-auto">
        <table className="w-full text-xs sm:text-sm">
          <thead className="bg-muted/40 text-muted-foreground sticky top-0 z-10">
            <tr>
              <th className="px-2 sm:px-4 py-1.5 sm:py-2 text-left">Soal</th>
              <th className="px-2 sm:px-4 py-1.5 sm:py-2 text-right text-primary">Dep (%)</th>
              <th className="px-2 sm:px-4 py-1.5 sm:py-2 text-right text-secondary">Anx (%)</th>
              <th className="px-2 sm:px-4 py-1.5 sm:py-2 text-right text-destructive">Str (%)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row) => (
              <tr key={row.question_id} className="hover:bg-muted/30">
                <td className="px-2 sm:px-4 py-1.5 sm:py-2 font-mono text-muted-foreground">#{row.question_id}</td>
                <td className="px-2 sm:px-4 py-1.5 sm:py-2 text-right font-semibold text-primary/80">{row.depression.toFixed(2)}</td>
                <td className="px-2 sm:px-4 py-1.5 sm:py-2 text-right font-semibold text-secondary/80">{row.anxiety.toFixed(2)}</td>
                <td className="px-2 sm:px-4 py-1.5 sm:py-2 text-right font-semibold text-destructive/80">{row.stress.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
)

const renderRankingCard = (ranking: GroupExpertRanking) => {
  const influencePercent = Math.max(0, Math.min(ranking.influence_percent ?? 0, 100))

  return (
    <div key={ranking.user_id} className="border border-border rounded-xl p-3 sm:p-4 space-y-3 sm:space-y-4 bg-card shadow-sm">
      <div className="flex flex-col gap-2 sm:gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full font-bold text-xs sm:text-sm shadow-sm bg-primary text-primary-foreground">
            #{ranking.rank}
          </span>
          <div className="min-w-0">
            <h3 className="text-sm sm:text-lg font-semibold text-foreground flex items-center gap-1.5 sm:gap-2">
              <Award className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" /> <span className="truncate">{ranking.username || "Pakar Tanpa Nama"}</span>
            </h3>
            <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{ranking.email || "-"}</p>
          </div>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-[10px] sm:text-xs uppercase text-muted-foreground">Bobot Pengaruh</p>
          <p className="text-lg sm:text-xl font-bold text-primary">{influencePercent.toFixed(2)}%</p>
          <div className="w-32 sm:w-40 h-1.5 sm:h-2 bg-muted rounded-full overflow-hidden mt-1">
            <div className="h-full bg-primary rounded-full" style={{ width: `${influencePercent}%` }}></div>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2">
        {renderCapability(ranking.capability)}
        {renderPreferences(ranking.preferences)}
      </div>
    </div>
  )
}

export function ExpertRankingModal({
  open,
  onClose,
  groupName,
  groupDescription,
  loading,
  error,
  progressText,
  detail,
}: ExpertRankingModalProps) {
  const [showConsensus, setShowConsensus] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setShowConsensus(false)
    }
  }, [open, detail])

  // Decode auth token to get role/email for conditional UI (hide other experts for expert role)
  useEffect(() => {
    try {
      const token = typeof window !== "undefined" ? sessionStorage.getItem("authToken") : null
      if (token) {
        const decoded: any = jwtDecode(token)
        setUserRole(decoded?.role ?? null)
        setUserEmail(decoded?.sub ?? null)
      } else {
        setUserRole(null)
        setUserEmail(null)
      }
    } catch {
      setUserRole(null)
      setUserEmail(null)
    }
  }, [])

  const consensusRows = useMemo(() => {
    if (!detail?.consensus_matrix) return []
    return [...detail.consensus_matrix].sort((a, b) => a.question_id - b.question_id)
  }, [detail])

  // Determine which rankings to show: for expert role, only show the logged-in expert's entry.
  const visibleRankings = useMemo(() => {
    const list = detail?.rankings ?? []
    if (userRole === "expert" && userEmail) {
      return list.filter((r) => r.email === userEmail)
    }
    return list
  }, [detail, userRole, userEmail])

  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-2 sm:px-4">
      <div className="bg-card border border-border rounded-xl sm:rounded-2xl shadow-2xl max-w-5xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 border-b border-border bg-muted/30">
          <div className="min-w-0 flex-1 pr-2">
            <h2 className="text-base sm:text-xl font-bold flex items-center gap-1.5 sm:gap-2">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" /> <span className="truncate">{groupName || "Detail Grup"}</span>
            </h2>
            <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
              {groupDescription || "Tidak ada deskripsi untuk grup ini."}
            </p>
          </div>
          <button className="text-muted-foreground hover:text-destructive shrink-0 p-1" onClick={onClose} aria-label="Tutup">
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        <div className="p-3 sm:p-6 space-y-3 sm:space-y-5 overflow-y-auto max-h-[calc(95vh-3.5rem)] sm:max-h-[calc(90vh-4rem)]">
          {loading && (
            <div className="flex flex-col items-center justify-center py-10 sm:py-16 bg-card border border-border shadow-sm rounded-xl">
              <div className="relative mb-4 sm:mb-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-muted rounded-full"></div>
                <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-primary border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
              </div>
              <h2 className="text-base sm:text-xl font-semibold text-foreground">Sedang Memproses...</h2>
              <div className="h-5 sm:h-6 mt-2 overflow-hidden flex justify-center">
                <p className="text-xs sm:text-sm text-primary font-medium animate-pulse">{progressText}</p>
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-3 sm:mt-4 max-w-md text-center px-4">
                Sistem sedang menghitung ranking pakar dan konsensus matriks untuk grup ini.
              </p>
            </div>
          )}

          {error && !loading && (
            <div className="border border-destructive bg-destructive/10 text-destructive px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm">
              {error}
            </div>
          )}

          {!loading && !error && detail && (
            <>
              <div className="flex flex-col gap-2 sm:gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
                  <Award className="w-3 h-3 sm:w-4 sm:h-4 text-primary" /> {detail.rankings.length} pakar dalam grup ini.
                </div>
                {detail.weights_info && (
                  <div className="text-[10px] sm:text-xs text-muted-foreground">
                    <span className="font-medium">Bobot:</span>
                    {detail.weights_info.created_at ? (
                      <span> {new Date(detail.weights_info.created_at).toLocaleDateString()}</span>
                    ) : (
                      <span> Tersimpan</span>
                    )}
                  </div>
                )}
                {consensusRows.length > 0 && (
                  <button
                    className="inline-flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => setShowConsensus(true)}
                  >
                    <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" /> <span className="hidden sm:inline">Lihat</span> Konsensus
                  </button>
                )}
              </div>

              {showConsensus
                ? renderConsensusMatrix(consensusRows, () => setShowConsensus(false))
                : visibleRankings.length === 0
                  ? (
                      <div className="border border-dashed border-border rounded-xl p-6 sm:p-10 text-center text-xs sm:text-sm text-muted-foreground">
                        Belum ada pakar di dalam grup ini.
                      </div>
                    )
                  : (
                      <div className="space-y-3 sm:space-y-4">
                        {visibleRankings.map((ranking) => renderRankingCard(ranking))}
                      </div>
                    )}
            </>
          )}

          {!loading && !error && !detail && (
            <div className="text-center text-xs sm:text-sm text-muted-foreground py-8 sm:py-10">
              Data ranking tidak tersedia.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
