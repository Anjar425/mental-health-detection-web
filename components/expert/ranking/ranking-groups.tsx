"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { BarChart3, Eye, Loader2, Users } from "lucide-react"

import { ExpertRankingModal } from "@/components/expert/ranking/ranking-detail-modal"
import { getExpertGroupRankingDetail, getExpertGroupsForPortal, type ExpertGroupSummary } from "@/services/expert"
import type { GroupRankingDetail } from "@/services/admin"

const DETAIL_LOADING_STEPS = [
  "Memuat profil & preferensi pakar...",
  "Menghitung Bobot Kapabilitas...",
  "Melakukan Normalisasi Preferensi...",
  "Inisialisasi Algoritma Ranking...",
  "Evaluasi Bobot Pengaruh...",
  "Finalisasi Ranking & Konsensus...",
]

export function ExpertRankingGroups() {
  const [groups, setGroups] = useState<ExpertGroupSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<ExpertGroupSummary | null>(null)
  const [detail, setDetail] = useState<GroupRankingDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [detailProgressText, setDetailProgressText] = useState<string>(DETAIL_LOADING_STEPS[0])

  const intervalRef = useRef<number | null>(null)
  const activeRequestRef = useRef<boolean>(false)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError(null)

    getExpertGroupsForPortal()
      .then((data) => {
        if (!mounted) return
        const sorted = [...(data || [])].sort((a, b) => a.name.localeCompare(b.name))
        setGroups(sorted)
      })
      .catch((err) => {
        console.error("Failed to load expert groups", err)
        if (!mounted) return
        setError("Gagal memuat daftar grup pakar. Pastikan backend aktif dan Anda memiliki akses.")
      })
      .finally(() => {
        if (!mounted) return
        setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current)
      }
      activeRequestRef.current = false
    }
  }, [])

  const handleOpenGroup = (group: ExpertGroupSummary) => {
    setSelectedGroup(group)
    setModalOpen(true)
    setDetail(null)
    setDetailError(null)
    setDetailProgressText(DETAIL_LOADING_STEPS[0])
    setDetailLoading(true)

    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current)
    }

    let stepIndex = 0
    intervalRef.current = window.setInterval(() => {
      stepIndex += 1
      if (stepIndex < DETAIL_LOADING_STEPS.length) {
        setDetailProgressText(DETAIL_LOADING_STEPS[stepIndex])
      }
    }, 1500)

    activeRequestRef.current = true

    getExpertGroupRankingDetail(group.id)
      .then((data) => {
        if (!activeRequestRef.current) return
        setDetail(data)
      })
      .catch((err) => {
        console.error("Failed to load group ranking detail", err)
        if (!activeRequestRef.current) return
        const message = err instanceof Error ? err.message : "Terjadi kesalahan saat memuat detail ranking."
        setDetailError(message)
      })
      .finally(() => {
        if (intervalRef.current !== null) {
          window.clearInterval(intervalRef.current)
          intervalRef.current = null
        }
        activeRequestRef.current = false
        setDetailLoading(false)
      })
  }

  const closeModal = () => {
    setModalOpen(false)
    setSelectedGroup(null)
    setDetail(null)
    setDetailError(null)
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    activeRequestRef.current = false
  }

  const totalMembers = useMemo(() => groups.reduce((acc, group) => acc + (group.member_count ?? 0), 0), [groups])

  return (
    <section className="space-y-4 sm:space-y-6">
      <header className="space-y-1">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight">Ranking Pakar per Grup</h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Pilih grup pakar untuk melihat bobot pengaruh, kapabilitas, dan preferensi DASS-21 setiap pakar. Data hanya dapat dilihat tanpa opsi hitung ulang bobot.
        </p>
      </header>

      {error && (
        <div className="border border-destructive text-destructive bg-destructive/10 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12 sm:py-24">
          <div className="flex flex-col items-center gap-2 sm:gap-3 text-muted-foreground">
            <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin" />
            <p className="text-xs sm:text-sm">Sedang memuat daftar grup pakar...</p>
          </div>
        </div>
      ) : groups.length === 0 ? (
        <div className="border border-border bg-card rounded-xl p-6 sm:p-10 text-center text-xs sm:text-sm text-muted-foreground">
          Belum ada grup pakar yang terkait dengan akun Anda.
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between text-[10px] sm:text-xs text-muted-foreground">
            <span>Total grup: {groups.length}</span>
            <span>Total pakar dalam seluruh grup: {totalMembers}</span>
          </div>
          <div className="grid gap-3 sm:gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
            {groups.map((group) => (
              <button
                key={group.id}
                className="text-left border border-border bg-card hover:bg-muted/40 rounded-xl p-3 sm:p-5 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                onClick={() => handleOpenGroup(group)}
              >
                <div className="flex items-start justify-between gap-2 sm:gap-3">
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-lg font-semibold text-foreground flex items-center gap-1.5 sm:gap-2">
                      <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" /> <span className="truncate">{group.name}</span>
                    </h3>
                    <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 line-clamp-2">
                      {group.description || "Tidak ada deskripsi"}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs bg-primary/10 text-primary px-2 sm:px-3 py-0.5 sm:py-1 rounded-full border border-primary/20 shrink-0">
                    <BarChart3 className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> {group.member_count ?? 0} <span className="hidden sm:inline">Pakar</span>
                  </span>
                </div>
                <div className="mt-4 sm:mt-6 flex items-center justify-between text-[10px] sm:text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5 sm:gap-2">
                    <Eye className="w-3 h-3 sm:w-4 sm:h-4" /> Lihat Ranking
                  </span>
                  <span>
                    {group.created_at ? new Date(group.created_at).toLocaleDateString() : "-"}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      <ExpertRankingModal
        open={modalOpen}
        onClose={closeModal}
        groupName={selectedGroup?.name}
        groupDescription={selectedGroup?.description}
        loading={detailLoading}
        error={detailError}
        progressText={detailProgressText}
        detail={detail}
      />
    </section>
  )
}
