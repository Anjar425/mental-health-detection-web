"use client"

import { useEffect, useMemo, useState } from "react"
import { Award, BarChart3, LayoutGrid, Users, X } from "lucide-react"

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
      <div className="bg-muted/20 border border-border rounded-lg p-3 text-sm text-muted-foreground">
        Tidak ada data kapabilitas tersedia.
      </div>
    )
  }

  return (
    <div className="bg-muted/40 border border-border rounded-lg p-3 text-sm grid grid-cols-1 sm:grid-cols-2 gap-2">
      <div>
        <span className="text-muted-foreground">Pendidikan</span>
        <p className="font-medium text-foreground">{capability.education_level || "-"}</p>
      </div>
      <div>
        <span className="text-muted-foreground">Publikasi</span>
        <p className="font-medium text-foreground">{capability.publication_count ?? 0}</p>
      </div>
      <div>
        <span className="text-muted-foreground">Jumlah Pasien</span>
        <p className="font-medium text-foreground">{capability.patient_count ?? 0}</p>
      </div>
      <div>
        <span className="text-muted-foreground">Pengalaman</span>
        <p className="font-medium text-foreground">{capability.flight_hours ?? 0} tahun</p>
      </div>
      <div>
        <span className="text-muted-foreground">Bobot Pengalaman</span>
        <p className="font-medium text-foreground">{capability.weight_JT ?? 0}%</p>
      </div>
      <div>
        <span className="text-muted-foreground">Bobot Pasien</span>
        <p className="font-medium text-foreground">{capability.weight_Pat ?? 0}%</p>
      </div>
      <div>
        <span className="text-muted-foreground">Bobot Pendidikan</span>
        <p className="font-medium text-foreground">{capability.weight_Pend ?? 0}%</p>
      </div>
      <div>
        <span className="text-muted-foreground">Bobot Publikasi</span>
        <p className="font-medium text-foreground">{capability.weight_Pub ?? 0}%</p>
      </div>
    </div>
  )
}

const renderPreferences = (preferences: GroupExpertRanking["preferences"] | null | undefined) => {
  if (!preferences || preferences.length === 0) {
    return (
      <div className="border border-border rounded-lg p-4 text-sm text-muted-foreground bg-muted/20">
        Preferensi DASS-21 tidak tersedia.
      </div>
    )
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="bg-muted/40 px-3 py-2 flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
        Preferensi DASS-21
      </div>
      <div className="max-h-56 overflow-y-auto text-xs">
        <table className="w-full">
          <thead className="bg-muted/40 sticky top-0 z-10">
            <tr className="text-muted-foreground">
              <th className="px-3 py-2 text-left w-16">Soal</th>
              <th className="px-3 py-2 text-right text-primary">Depresi</th>
              <th className="px-3 py-2 text-right text-secondary">Kecemasan</th>
              <th className="px-3 py-2 text-right text-destructive">Stres</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {preferences.map((pref) => (
              <tr key={pref.question_id} className="hover:bg-muted/20">
                <td className="px-3 py-1 font-mono text-muted-foreground">#{pref.question_id}</td>
                <td className="px-3 py-1 text-right font-medium text-primary/80">{pref.depression.toFixed(2)}%</td>
                <td className="px-3 py-1 text-right font-medium text-secondary/80">{pref.anxiety.toFixed(2)}%</td>
                <td className="px-3 py-1 text-right font-medium text-destructive/80">{pref.stress.toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const renderConsensusMatrix = (rows: GroupConsensusRow[], onClose: () => void) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between gap-2">
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <LayoutGrid className="w-5 h-5 text-primary" /> Konsensus Matriks Akhir
        </h3>
        <p className="text-xs text-muted-foreground">
          Nilai agregasi (Depression, Anxiety, Stress) per butir DASS-21 menggunakan bobot pakar dalam grup.
        </p>
      </div>
      <button
        className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md bg-muted text-foreground hover:bg-muted/80"
        onClick={onClose}
      >
        <X className="w-4 h-4" /> Tutup Konsensus
      </button>
    </div>

    <div className="border border-border rounded-xl overflow-hidden">
      <div className="max-h-[60vh] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-muted-foreground sticky top-0 z-10">
            <tr>
              <th className="px-4 py-2 text-left">Soal</th>
              <th className="px-4 py-2 text-right text-primary">Depresi (%)</th>
              <th className="px-4 py-2 text-right text-secondary">Kecemasan (%)</th>
              <th className="px-4 py-2 text-right text-destructive">Stres (%)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row) => (
              <tr key={row.question_id} className="hover:bg-muted/30">
                <td className="px-4 py-2 font-mono text-muted-foreground">#{row.question_id}</td>
                <td className="px-4 py-2 text-right font-semibold text-primary/80">{row.depression.toFixed(2)}</td>
                <td className="px-4 py-2 text-right font-semibold text-secondary/80">{row.anxiety.toFixed(2)}</td>
                <td className="px-4 py-2 text-right font-semibold text-destructive/80">{row.stress.toFixed(2)}</td>
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
    <div key={ranking.user_id} className="border border-border rounded-xl p-4 space-y-4 bg-card shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm shadow-sm bg-primary text-primary-foreground">
            #{ranking.rank}
          </span>
          <div>
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" /> {ranking.username || "Pakar Tanpa Nama"}
            </h3>
            <p className="text-xs text-muted-foreground">{ranking.email || "-"}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase text-muted-foreground">Bobot Pengaruh</p>
          <p className="text-xl font-bold text-primary">{influencePercent.toFixed(2)}%</p>
          <div className="w-40 h-2 bg-muted rounded-full overflow-hidden mt-1">
            <div className="h-full bg-primary rounded-full" style={{ width: `${influencePercent}%` }}></div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
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

  useEffect(() => {
    if (open) {
      setShowConsensus(false)
    }
  }, [open, detail])

  const consensusRows = useMemo(() => {
    if (!detail?.consensus_matrix) return []
    return [...detail.consensus_matrix].sort((a, b) => a.question_id - b.question_id)
  }, [detail])

  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" /> {groupName || "Detail Grup"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {groupDescription || "Tidak ada deskripsi untuk grup ini."}
            </p>
          </div>
          <button className="text-muted-foreground hover:text-destructive" onClick={onClose} aria-label="Tutup">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-4rem)]">
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 bg-card border border-border shadow-sm rounded-xl">
              <div className="relative mb-6">
                <div className="w-16 h-16 border-4 border-muted rounded-full"></div>
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
              </div>
              <h2 className="text-xl font-semibold text-foreground">Sedang Memproses...</h2>
              <div className="h-6 mt-2 overflow-hidden flex justify-center">
                <p className="text-primary font-medium animate-pulse">{progressText}</p>
              </div>
              <p className="text-xs text-muted-foreground mt-4 max-w-md text-center px-4">
                Sistem sedang menghitung ranking pakar dan konsensus matriks untuk grup ini.
              </p>
            </div>
          )}

          {error && !loading && (
            <div className="border border-destructive bg-destructive/10 text-destructive px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {!loading && !error && detail && (
            <>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Award className="w-4 h-4 text-primary" /> {detail.rankings.length} pakar dalam grup ini.
                </div>
                {detail.weights_info && (
                  <div className="text-xs text-muted-foreground mt-1">
                    <span className="font-medium">Bobot:</span>
                    {detail.weights_info.created_at ? (
                      <span> Tersimpan pada {new Date(detail.weights_info.created_at).toLocaleString()}</span>
                    ) : (
                      <span> Tersimpan (tanggal tidak tersedia)</span>
                    )}
                    {detail.weights_info.meta?.source && (
                      <span> — Sumber: {detail.weights_info.meta.source}</span>
                    )}
                  </div>
                )}
                {consensusRows.length > 0 && (
                  <button
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => setShowConsensus(true)}
                  >
                    <BarChart3 className="w-4 h-4" /> Lihat Konsensus Matriks
                  </button>
                )}
              </div>

              {showConsensus
                ? renderConsensusMatrix(consensusRows, () => setShowConsensus(false))
                : detail.rankings.length === 0
                  ? (
                      <div className="border border-dashed border-border rounded-xl p-10 text-center text-muted-foreground">
                        Belum ada pakar di dalam grup ini.
                      </div>
                    )
                  : (
                      <div className="space-y-4">
                        {detail.rankings.map((ranking) => renderRankingCard(ranking))}
                      </div>
                    )}
            </>
          )}

          {!loading && !error && !detail && (
            <div className="text-center text-muted-foreground py-10">
              Data ranking tidak tersedia.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
