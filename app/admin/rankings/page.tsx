"use client"

import React, { useEffect, useState } from "react"
import { AdminNav } from "../../../components/admin/AdminNav"
import { getRankings, getConsensus } from "../../../services/admin"
import type { Ranking, Consensus } from "../../../services/admin"

// Sequence of loading messages for GA simulation
const LOADING_STEPS = [
  "Memuat data profil & preferensi pakar...",
  "Menghitung Bobot Dasar (Metode SAW)...",
  "Melakukan Defuzzifikasi Preferensi & Fuzzy IOWA...",
  "Inisialisasi Populasi Algoritma Genetika...",
  "Evolusi Bobot (Crossover & Mutation)...",
  "Evaluasi Fitness & Penalti Distribusi...",
  "Finalisasi Konsensus & Ranking Pakar...",
]

export default function RankingsPage() {
  const [rankings, setRankings] = useState<Ranking[]>([])
  const [consensus, setConsensus] = useState<Consensus[]>([])
  
  // State for Loading & Error
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // State for animated progress text
  const [progressText, setProgressText] = useState(LOADING_STEPS[0])

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError(null)
    
    // 1. Setup Timer for Simulated Progress Text
    let stepIndex = 0
    const intervalId = setInterval(() => {
      stepIndex++
      if (stepIndex < LOADING_STEPS.length) {
        setProgressText(LOADING_STEPS[stepIndex])
      }
    }, 2500) 

    // 2. Fetch Data (Parallel)
    Promise.all([getRankings(), getConsensus()])
      .then(([r, c]) => {
        if (!mounted) return
        
        // Sort rankings by rank number
        const sortedRankings = (r || []).slice().sort((a, b) => {
          return (a.rank ?? 0) - (b.rank ?? 0)
        })
        
        setRankings(sortedRankings)
        setConsensus(c || [])
      })
      .catch((err) => {
        console.error("Failed to load rankings/consensus:", err)
        setError("Gagal memproses Algoritma Genetika. Pastikan backend aktif.")
      })
      .finally(() => {
        if (mounted) {
          setLoading(false)
          clearInterval(intervalId) // Stop animation
        }
      })

    return () => {
      mounted = false
      clearInterval(intervalId)
    }
  }, [])

  // Helper to determine the highest value in a row for highlighting
  const getHighestCategory = (c: Consensus) => {
    const d = Number(c.depression)
    const a = Number(c.anxiety)
    const s = Number(c.stress)
    
    // If all are zero, no highlight
    if (d === 0 && a === 0 && s === 0) return null

    const max = Math.max(d, a, s)
    if (max === d) return 'depression'
    if (max === a) return 'anxiety'
    return 'stress'
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <AdminNav />
      <main className="flex-1 container mx-auto p-6 space-y-8">
        
        {/* HEADER */}
        <header className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Sistem Pendukung Keputusan (GDSS)
          </h1>
          <p className="text-muted-foreground text-sm">
            Optimasi Bobot Pakar menggunakan <strong>Algoritma Genetika</strong> & <strong>Fuzzy IOWA</strong>.
          </p>
        </header>

        {/* --- ERROR DISPLAY --- */}
        {error && (
          <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-lg text-sm font-medium animate-in fade-in slide-in-from-top-2">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* --- LOADING DISPLAY (Progress Simulation) --- */}
        {loading && !error && (
          <div className="flex flex-col items-center justify-center py-24 bg-card border border-border shadow-sm rounded-xl animate-in fade-in zoom-in duration-500">
            {/* Spinner with Primary Theme Color */}
            <div className="relative mb-6">
              <div className="w-16 h-16 border-4 border-muted rounded-full"></div>
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
            </div>
            
            <h2 className="text-xl font-semibold text-foreground">Sedang Memproses...</h2>
            
            <div className="h-6 mt-2 overflow-hidden flex justify-center">
              <p className="text-primary font-medium transition-all duration-500 animate-pulse">
                {progressText}
              </p>
            </div>
            
            <p className="text-xs text-muted-foreground mt-4 max-w-md text-center px-4">
              Sistem sedang melakukan simulasi evolusi populasi genetik untuk mencari konsensus terbaik dari preferensi pakar.
            </p>
          </div>
        )}

        {/* --- MAIN CONTENT (Data Loaded) --- */}
        {!loading && !error && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
            
            {/* SECTION 1: EXPERT RANKINGS */}
            <section className="bg-card border border-border shadow-sm rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-border bg-muted/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <h2 className="font-semibold text-lg text-card-foreground">Expert Weight Rankings</h2>
                  <p className="text-xs text-muted-foreground">Hasil optimasi bobot pakar setelah proses GA.</p>
                </div>
                <span className="text-xs font-mono bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20">
                  Status: GA Optimized (Thesis Mode)
                </span>
              </div>
              
              {rankings.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground italic">
                  Data pakar tidak ditemukan.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
                      <tr>
                        <th className="p-4 w-20 text-center">Rank</th>
                        <th className="p-4">Expert Name</th>
                        <th className="p-4">Email</th>
                        <th className="p-4 text-right">Optimized Weight</th>
                        <th className="p-4 text-right">Contribution</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {rankings.map((r, idx) => (
                        <tr key={r.expert_id} className="hover:bg-muted/30 transition-colors">
                          <td className="p-4 text-center">
                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs shadow-sm
                              ${idx === 0 ? 'bg-primary text-primary-foreground' : 
                                idx === 1 ? 'bg-secondary text-secondary-foreground' : 
                                idx === 2 ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'}`}>
                              {r.rank}
                            </span>
                          </td>
                          <td className="p-4 font-medium text-foreground">
                            {r.username || `Expert ${r.expert_id}`}
                          </td>
                          <td className="p-4 text-muted-foreground">{r.email}</td>
                          <td className="p-4 text-right font-mono text-primary font-bold text-base">
                            {Number(r.weight).toFixed(4)}
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <span className="text-xs text-muted-foreground">{(Number(r.weight) * 100).toFixed(1)}%</span>
                              <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-primary rounded-full transition-all duration-1000 ease-out" 
                                  style={{ width: `${Number(r.weight) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* SECTION 2: CONSENSUS MATRIX */}
            <section className="bg-card border border-border shadow-sm rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-border bg-muted/30">
                <h2 className="font-semibold text-lg text-card-foreground">Consensus Matrix (DASS-21 Items)</h2>
                <p className="text-xs text-muted-foreground">
                  Nilai agregasi (Depression, Anxiety, Stress) untuk setiap item kuesioner. <span className="font-semibold">Nilai tertinggi ditandai tebal.</span>
                </p>
              </div>

              {consensus.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground italic">
                  Belum ada data konsensus.
                </div>
              ) : (
                <div className="overflow-x-auto max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-muted/50 text-muted-foreground sticky top-0 z-10 shadow-sm backdrop-blur-md">
                      <tr>
                        <th className="p-3 border-b border-border w-24 text-center">Item #</th>
                        <th className="p-3 border-b border-border text-right text-primary font-semibold">Depression (%)</th>
                        <th className="p-3 border-b border-border text-right text-secondary font-semibold">Anxiety (%)</th>
                        <th className="p-3 border-b border-border text-right text-destructive font-semibold">Stress (%)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {consensus.map((c) => {
                        const highest = getHighestCategory(c);
                        return (
                          <tr key={c.dass21_id} className="hover:bg-muted/30 transition-colors">
                            <td className="p-3 font-mono font-bold text-muted-foreground border-r border-border bg-muted/10 text-center">
                              {c.dass21_id}
                            </td>
                            
                            {/* DEPRESSION COLUMN */}
                            <td className="p-3 text-right font-mono text-foreground">
                              {Number(c.depression) > 0 ? (
                                <span className={`${highest === 'depression' 
                                  ? 'text-primary-foreground bg-primary font-bold px-2 py-1 rounded shadow-sm' 
                                  : 'text-primary font-medium bg-primary/5 px-2 py-1 rounded'}`}>
                                  {Number(c.depression).toFixed(2)}
                                </span>
                              ) : <span className="text-muted-foreground/30">-</span>}
                            </td>

                            {/* ANXIETY COLUMN */}
                            <td className="p-3 text-right font-mono text-foreground">
                              {Number(c.anxiety) > 0 ? (
                                <span className={`${highest === 'anxiety' 
                                  ? 'text-secondary-foreground bg-secondary font-bold px-2 py-1 rounded shadow-sm' 
                                  : 'text-secondary font-medium bg-secondary/5 px-2 py-1 rounded'}`}>
                                  {Number(c.anxiety).toFixed(2)}
                                </span>
                              ) : <span className="text-muted-foreground/30">-</span>}
                            </td>

                            {/* STRESS COLUMN */}
                            <td className="p-3 text-right font-mono text-foreground">
                              {Number(c.stress) > 0 ? (
                                <span className={`${highest === 'stress' 
                                  ? 'text-destructive-foreground bg-destructive font-bold px-2 py-1 rounded shadow-sm' 
                                  : 'text-destructive font-medium bg-destructive/5 px-2 py-1 rounded'}`}>
                                  {Number(c.stress).toFixed(2)}
                                </span>
                              ) : <span className="text-muted-foreground/30">-</span>}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  )
}