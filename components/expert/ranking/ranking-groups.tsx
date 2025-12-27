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
    <section className="space-y-6">
      <header className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">Ranking Pakar per Grup</h2>
        <p className="text-sm text-muted-foreground">
          Pilih grup pakar untuk melihat bobot pengaruh, kapabilitas, dan preferensi DASS-21 setiap pakar. Data hanya dapat dilihat tanpa opsi hitung ulang bobot.
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
          Belum ada grup pakar yang terkait dengan akun Anda.
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Total grup: {groups.length}</span>
            <span>Total pakar dalam seluruh grup: {totalMembers}</span>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
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
