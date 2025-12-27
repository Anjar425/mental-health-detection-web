"use client"

import React, { useEffect, useMemo, useState } from "react"
import { AdminNav } from "../../../components/admin/AdminNav"
import {
  getExpertGroups,
  getGroupRankingDetail,
  invalidateGroupWeights,
  recomputeGroupWeights,
} from "../../../services/admin"
import type {
  ExpertGroup,
  GroupRankingDetail,
  GroupExpertRanking,
  GroupConsensusRow,
} from "../../../services/admin"
import { Users, Award, Loader2, BarChart3, Eye, Activity, X, LayoutGrid } from "lucide-react"

export default function RankingsPage() {
  const [groups, setGroups] = useState<ExpertGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<ExpertGroup | null>(null)
  const [rankingDetail, setRankingDetail] = useState<GroupRankingDetail | null>(null)
  const [showConsensus, setShowConsensus] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [detailProgressText, setDetailProgressText] = useState("")

  // Sequence of loading messages for group ranking detail simulation
  const DETAIL_LOADING_STEPS = [
    "Memuat profil & preferensi pakar...",
    "Menghitung Bobot Kapabilitas...",
    "Melakukan Normalisasi Preferensi...",
    "Inisialisasi Algoritma Ranking...",
    "Evaluasi Bobot Pengaruh...",
    "Finalisasi Ranking & Konsensus...",
  ]

  useEffect(() => {
    let mounted = true
    setLoading(true)
    getExpertGroups()
      .then((data) => {
        if (!mounted) return
        setGroups((data || []).sort((a, b) => a.name.localeCompare(b.name)))
      })
      .catch((err) => {
        console.error("Failed to load groups", err)
        setError("Gagal memuat daftar grup pakar. Pastikan backend aktif.")
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [])

  const handleOpenGroup = (group: ExpertGroup) => {
    setSelectedGroup(group)
    setModalOpen(true)
    setDetailLoading(true)
    setShowConsensus(false)
    setRankingDetail(null)
    setDetailError(null)
    setDetailProgressText(DETAIL_LOADING_STEPS[0])

    // Setup Timer for Simulated Progress Text
    let stepIndex = 0
    const intervalId = setInterval(() => {
      stepIndex++
      if (stepIndex < DETAIL_LOADING_STEPS.length) {
        setDetailProgressText(DETAIL_LOADING_STEPS[stepIndex])
      }
    }, 1500) // Faster than global rankings for quicker feel

    getGroupRankingDetail(group.id)
      .then((detail) => {
        setRankingDetail(detail)
      })
      .catch((err) => {
        console.error("Failed to load group ranking", err)
        // Show more informative error (network / API error)
        setDetailError(err?.message || "Gagal memuat ranking pakar untuk grup ini.")
      })
      .finally(() => {
        setDetailLoading(false)
        clearInterval(intervalId) // Stop animation
      })
  }

  const closeModal = () => {
    setModalOpen(false)
    setSelectedGroup(null)
    setRankingDetail(null)
    setShowConsensus(false)
    setDetailError(null)
  }

  // Quick auth detection for UI (client-only)
  const isAuthenticated = typeof window !== "undefined" && !!sessionStorage.getItem("authToken")


  const consensusRows = useMemo(() => {
    if (!rankingDetail) return []
    return [...(rankingDetail.consensus_matrix || [])].sort((a, b) => a.question_id - b.question_id)
  }, [rankingDetail])

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
          <Activity className="w-4 h-4" /> Preferensi DASS-21
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

  const renderConsensusMatrix = (rows: GroupConsensusRow[]) => (
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
          onClick={() => setShowConsensus(false)}
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
    // If weights_by_user is available, prefer that saved value to ensure permanence
    const savedWeightEntry = (rankingDetail?.weights_info?.weights_by_user || []).find((w) => w.user_id === ranking.user_id)
    const influence = savedWeightEntry ? Math.max(0, Math.min(savedWeightEntry.weight * 100.0, 100)) : Math.max(0, Math.min(ranking.influence_percent ?? 0, 100))

    return (
      <div key={ranking.user_id} className="border border-border rounded-xl p-4 space-y-4 bg-card shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm shadow-sm bg-primary text-primary-foreground`}>
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
            <p className="text-xl font-bold text-primary">{influence.toFixed(2)}%</p>
            <div className="w-40 h-2 bg-muted rounded-full overflow-hidden mt-1">
              <div className="h-full bg-primary rounded-full" style={{ width: `${influence}%` }}></div>
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

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <AdminNav />
      <main className="flex-1 container mx-auto p-6 space-y-6">
        <header className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Ranking Pakar per Grup</h1>
          <p className="text-sm text-muted-foreground">
            Pilih grup pakar untuk melihat bobot pengaruh, kapabilitas, dan preferensi DASS-21 masing-masing pakar.
          </p>
        </header>

        {error && (
          <div className="border border-destructive text-destructive bg-destructive/10 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p className="text-sm">Sedang memuat daftar grup pakar...</p>
            </div>
          </div>
        ) : groups.length === 0 ? (
          <div className="border border-border bg-card rounded-xl p-10 text-center text-muted-foreground">
            Belum ada grup pakar yang terdaftar. Silakan buat grup terlebih dahulu.
          </div>
        ) : (
          <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {groups.map((group) => (
              <button
                key={group.id}
                className="text-left border border-border bg-card hover:bg-muted/40 rounded-xl p-5 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                onClick={() => handleOpenGroup(group)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" /> {group.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {group.description || "Tidak ada deskripsi"}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20">
                    <BarChart3 className="w-3 h-3" /> {group.member_count ?? 0} Pakar
                  </span>
                </div>
                <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-2">
                    <Eye className="w-4 h-4" /> Lihat Ranking Pakar
                  </span>
                  <span>
                    Dibuat: {group.created_at ? new Date(group.created_at).toLocaleDateString() : "-"}
                  </span>
                </div>
              </button>
            ))}
          </section>
        )}

        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" /> {selectedGroup?.name || "Detail Grup"}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {selectedGroup?.description || "Tidak ada deskripsi untuk grup ini."}
                  </p>
                </div>
                <button
                  className="text-muted-foreground hover:text-destructive"
                  onClick={closeModal}
                  aria-label="Tutup"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-4rem)]">
                {detailLoading && (
                  <div className="flex flex-col items-center justify-center py-16 bg-card border border-border shadow-sm rounded-xl animate-in fade-in zoom-in duration-500">
                    {/* Spinner with Primary Theme Color */}
                    <div className="relative mb-6">
                      <div className="w-16 h-16 border-4 border-muted rounded-full"></div>
                      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                    </div>
                    
                    <h2 className="text-xl font-semibold text-foreground">Sedang Memproses...</h2>
                    
                    <div className="h-6 mt-2 overflow-hidden flex justify-center">
                      <p className="text-primary font-medium transition-all duration-500 animate-pulse">
                        {detailProgressText}
                      </p>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mt-4 max-w-md text-center px-4">
                      Sistem sedang menghitung ranking pakar dan konsensus matriks untuk grup ini.
                    </p>
                  </div>
                )}

                {detailError && !detailLoading && (
                  <div className="border border-destructive bg-destructive/10 text-destructive px-4 py-3 rounded-lg text-sm">
                    {detailError}
                  </div>
                )}

                {!detailLoading && rankingDetail && (
                  <>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Award className="w-4 h-4 text-primary" /> {rankingDetail.rankings.length} pakar dalam grup ini.
                      </div>

                      {/* Show weights info if available */}
                      {rankingDetail.weights_info && (
                        <div className="text-xs text-muted-foreground mt-1">
                          <span className="font-medium">Bobot:</span>
                          {rankingDetail.weights_info.created_at ? (
                            <span> Tersimpan pada {new Date(rankingDetail.weights_info.created_at).toLocaleString()}</span>
                          ) : (
                            <span> Tersimpan (tanggal tidak tersedia)</span>
                          )}
                          {rankingDetail.weights_info.meta?.source && (
                            <span> — Sumber: {rankingDetail.weights_info.meta.source}</span>
                          )}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        {consensusRows.length > 0 && (
                          <button
                            className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
                            onClick={() => setShowConsensus(true)}
                          >
                            <BarChart3 className="w-4 h-4" /> Lihat Konsensus Matriks
                          </button>
                        )}

                        {/* Recompute weights button */}
                        <div className="flex items-center gap-3">
                          <button
                            className={`inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md ${isAuthenticated ? 'bg-muted text-foreground hover:bg-muted/80' : 'bg-muted/60 text-muted-foreground cursor-not-allowed'}`}
                            onClick={async () => {
                              setDetailLoading(true)
                              setDetailProgressText("Menghitung ulang bobot (menyimpan hasil terbaru)...")
                              try {
                                // Call explicit recompute endpoint that runs GA and persists the result
                                await recomputeGroupWeights(selectedGroup!.id)
                                // Re-fetch the ranking detail (this will load the newly saved weights)
                                const updated = await getGroupRankingDetail(selectedGroup!.id)
                                setRankingDetail(updated)
                                setDetailProgressText("Finalisasi Ranking & Konsensus...")
                              } catch (err: any) {
                                console.error("Failed to recompute weights", err)
                                setDetailError(err?.message || "Gagal menghitung ulang bobot. Periksa logs server.")
                              } finally {
                                setDetailLoading(false)
                              }
                            }}
                            disabled={detailLoading || !isAuthenticated}
                          >
                            <Activity className="w-4 h-4" /> Hitung Ulang Bobot
                          </button>

                          {(
                            <div className="text-xs text-muted-foreground">
                              <span className="font-medium">Login diperlukan</span> untuk menghitung ulang bobot.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {showConsensus
                      ? renderConsensusMatrix(consensusRows)
                      : rankingDetail.rankings.length === 0
                        ? (
                          <div className="border border-dashed border-border rounded-xl p-10 text-center text-muted-foreground">
                            Belum ada pakar di dalam grup ini.
                          </div>
                        )
                        : (
                          <div className="space-y-4">
                            {rankingDetail.rankings.map(renderRankingCard)}
                          </div>
                        )}
                  </>
                )}

                {!detailLoading && !rankingDetail && (
                  <div className="text-center text-muted-foreground py-10">
                    Data ranking tidak tersedia.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}