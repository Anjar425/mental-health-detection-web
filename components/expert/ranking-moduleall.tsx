"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, GraduationCap, Users, BookOpen, Clock, AlertCircle } from "lucide-react"
import axios from "axios"

interface NormalizedScores {
  education: number
  patient: number
  publication: number
  flight_hours: number
}

interface RankingDetails {
  education_str: string
  normalized_scores: NormalizedScores
}

interface RankingItem {
  expert_email: string
  score: number
  details: RankingDetails
}

interface GlobalWeights {
  education: number
  patient: number
  publication: number
  flight_hours: number
}

interface RankingResponse {
  global_average_weights: GlobalWeights
  rankings: RankingItem[]
}

export function RankingModule() {
  const [data, setData] = useState<RankingResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = sessionStorage.getItem("authToken")
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API}/expert/ranking/`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setData(res.data)
      } catch (err) {
        console.error("Failed to fetch rankings:", err)
        setError("Gagal memuat data ranking. Pastikan Anda memiliki akses.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Memuat analisis ranking SAW...</div>
  if (error) return <div className="p-8 text-center text-destructive flex flex-col items-center gap-2"><AlertCircle />{error}</div>
  if (!data) return null

  // Helper untuk warna progress bar
  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-emerald-500" // Tinggi
    if (score >= 50) return "bg-blue-500"    // Sedang
    return "bg-amber-500"                    // Rendah
  }

  // Icon mapping helper
  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-6 h-6 text-yellow-500" />
    if (index === 1) return <Medal className="w-6 h-6 text-slate-400" />
    if (index === 2) return <Medal className="w-6 h-6 text-amber-600" />
    return <span className="text-lg font-bold text-muted-foreground w-6 text-center">{index + 1}</span>
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* SECTION 1: Global Weights Visualization */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <WeightCard 
          icon={<GraduationCap className="w-4 h-4" />}
          title="Rata-rata Pend."
          value={data.global_average_weights.education}
          color="bg-chart-1"
        />
        <WeightCard 
          icon={<Users className="w-4 h-4" />}
          title="Rata-rata Pasien"
          value={data.global_average_weights.patient}
          color="bg-chart-2"
        />
        <WeightCard 
          icon={<BookOpen className="w-4 h-4" />}
          title="Rata-rata Publ."
          value={data.global_average_weights.publication}
          color="bg-chart-3"
        />
        <WeightCard 
          icon={<Clock className="w-4 h-4" />}
          title="Rata-rata Jam"
          value={data.global_average_weights.flight_hours}
          color="bg-chart-4"
        />
      </div>

      {/* SECTION 2: The Leaderboard */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Peringkat Rekomendasi Pakar
          </CardTitle>
          <CardDescription>
            Skor dihitung berdasarkan profil pakar dikalikan dengan <b>Rata-rata Bobot Global</b> (Simulasi SAW).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {data.rankings.map((expert, index) => (
            <div 
              key={expert.expert_email}
              className={`group relative p-4 rounded-xl border transition-all hover:shadow-md ${
                index === 0 ? "border-primary/50 bg-primary/5" : "border-border/40 hover:bg-muted/30"
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                
                {/* Rank Number/Icon */}
                <div className="flex items-center gap-4 min-w-[50px]">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-background border border-border shadow-sm">
                    {getRankIcon(index)}
                  </div>
                </div>

                {/* Expert Info */}
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground truncate">{expert.expert_email}</h3>
                    {/* Top Recommended badge removed here */}
                  </div>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 bg-muted px-2 py-0.5 rounded text-xs">
                      <GraduationCap className="w-3 h-3" /> {expert.details.education_str}
                    </span>
                  </p>
                </div>

                {/* Total Score Bar */}
                <div className="flex-1 w-full md:max-w-[300px] space-y-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-muted-foreground">Total Skor SAW</span>
                    <span className="font-bold text-foreground">{expert.score}</span>
                  </div>
                  <div className="h-3 w-full bg-secondary/30 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${getScoreColor(expert.score)}`} 
                      style={{ width: `${expert.score}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Detailed Breakdown (Mini Bars) */}
              <div className="mt-4 pt-4 border-t border-border/30 grid grid-cols-2 md:grid-cols-4 gap-4">
                 <MiniStat 
                   label="Kontribusi Pend." 
                   normalized={expert.details.normalized_scores.education} 
                   weight={data.global_average_weights.education}
                   color="bg-chart-1"
                 />
                 <MiniStat 
                   label="Kontribusi Pasien" 
                   normalized={expert.details.normalized_scores.patient} 
                   weight={data.global_average_weights.patient}
                   color="bg-chart-2"
                 />
                 <MiniStat 
                   label="Kontribusi Publ." 
                   normalized={expert.details.normalized_scores.publication} 
                   weight={data.global_average_weights.publication}
                   color="bg-chart-3"
                 />
                 <MiniStat 
                   label="Kontribusi Jam" 
                   normalized={expert.details.normalized_scores.flight_hours} 
                   weight={data.global_average_weights.flight_hours}
                   color="bg-chart-4"
                 />
              </div>
            </div>
          ))}

          {data.rankings.length === 0 && (
             <div className="text-center py-10 text-muted-foreground">Belum ada data pakar untuk diperingkat.</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Sub-component untuk Kartu Bobot
function WeightCard({ icon, title, value, color }: { icon: any, title: string, value: number, color: string }) {
  return (
    <Card className="border-border/40 bg-card/50 overflow-hidden relative">
      <div className={`absolute top-0 left-0 w-1 h-full ${color}`} />
      <CardContent className="p-4 flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            {icon} {title}
          </p>
          <p className="text-2xl font-bold tracking-tight">{Number(value).toFixed(2)}%</p>
        </div>
        <div className={`h-10 w-10 rounded-full opacity-10 flex items-center justify-center ${color.replace('bg-', 'text-')}`}>
           {icon}
        </div>
      </CardContent>
    </Card>
  )
}

// UPDATE: MiniStat sekarang menghitung Normalized Score * Global Weight
function MiniStat({ label, normalized, weight, color }: { label: string, normalized: number, weight: number, color: string }) {
  // Hitung kontribusi aktual (misal: 1.0 * 25% = 25%)
  const contribution = normalized * weight
  
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] text-muted-foreground uppercase tracking-wider">
        <span>{label}</span>
        {/* Tampilkan nilai kontribusi, bukan nilai normalisasi mentah */}
        <span className="font-mono text-foreground">{contribution.toFixed(2)}%</span>
      </div>
      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
        {/* Lebar bar tetap berdasarkan normalisasi (seberapa penuh kriteria terpenuhi) */}
        <div 
          className={`h-full rounded-full ${color}`} 
          style={{ width: `${normalized * 100}%` }} 
        />
      </div>
       {/* Optional: Menampilkan detail kecil di bawah bar */}
       <div className="flex justify-between text-[9px] text-muted-foreground/70">
          <span>Skor: {normalized.toFixed(1)}</span>
          <span>Bobot: {weight.toFixed(1)}%</span>
       </div>
    </div>
  )
}