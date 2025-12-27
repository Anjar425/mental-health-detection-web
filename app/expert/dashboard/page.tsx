"use client"

import { useEffect, useMemo, useState } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { ChartContainer, ChartTooltip, type ChartConfig } from "@/components/ui/chart"
import { LineChart, Line, CartesianGrid, XAxis, YAxis } from "recharts"
import { LogOut, TrendingUp, Users, ClipboardList } from "lucide-react"
import { RulesetModule } from "@/components/expert/ruleset-module"
import { PreferenceModule } from "@/components/expert/preference-module"
import { ProfileInfluenceModule } from "@/components/expert/profile-influence-module"
import { jwtDecode } from "jwt-decode"
import { RankingModule } from "@/components/expert/ranking-module"

// --- Interfaces ---
interface ExpertHistoryRecord {
  id: number
  user_id: number
  user_email: string
  user_name: string
  group_id: number | null
  group_name: string | null
  type: string
  depression_score: number | null
  anxiety_score: number | null
  stress_score: number | null
  highest_severity: string | null
  created_at: string
}

interface ManagedGroupSummary {
  id: number
  name: string
  description?: string | null
}

// --- Constants & Helpers ---
const HISTORY_COLOR_PALETTE = [
  "#4f46e5", "#0ea5e9", "#22c55e", "#facc15", 
  "#f97316", "#14b8a6", "#ec4899", "#a855f7",
]

// Helper untuk styling severity badge
const getSeverityColor = (level: string | null | undefined): string => {
  const severity = level?.toLowerCase() ?? ""
  switch (severity) {
    case "normal": return "bg-green-100 text-green-800 border-green-300"
    case "mild": return "bg-blue-100 text-blue-800 border-blue-300"
    case "moderate": return "bg-yellow-100 text-yellow-800 border-yellow-300"
    case "severe": return "bg-orange-100 text-orange-800 border-orange-300"
    case "extremely severe": return "bg-red-100 text-red-800 border-red-300"
    default: return "bg-gray-100 text-gray-800 border-gray-300"
  }
}

// Helper untuk mendapatkan badge style berdasarkan gejala dominan (Fix Tailwind Dynamic Classes)
const getDominantSymptomStyle = (d: number, a: number, s: number) => {
  if (d >= a && d >= s) return { label: "Depresi", className: "bg-blue-100 text-blue-800" }
  if (a >= d && a >= s) return { label: "Ansietas", className: "bg-purple-100 text-purple-800" }
  return { label: "Stres", className: "bg-orange-100 text-orange-800" }
}

const normalizeScore = (score: number | null | undefined): number => {
  if (score === null || score === undefined) return 0
  const numeric = Number(score)
  if (!Number.isFinite(numeric)) return 0
  // Asumsi: jika range 0-1 berarti persentase desimal
  if (numeric > 0 && numeric <= 1) {
    return numeric * 100
  }
  return numeric
}

const formatDass21Score = (score: number | null | undefined): string => {
  if (score === null || score === undefined) return "-"
  const normalized = normalizeScore(score)
  return normalized.toFixed(normalized % 1 === 0 ? 0 : 2) + "%"
}

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length > 0) {
    const data = payload[0].payload
    // Payload key bergantung pada line yang di-hover, namun data object memiliki semua key
    // Kita cari key meta yang valid
    const dataKey = payload[0].dataKey
    const meta = data[`${dataKey}__meta`]

    if (meta) {
      return (
        <div className="bg-background border border-border rounded p-3 shadow-md text-xs">
          <p className="font-bold mb-1">{meta.groupName}</p>
          <div className="text-muted-foreground mb-2">
            <p>{meta.userName}</p>
            <p>{meta.userEmail}</p>
            <p className="mt-1 font-mono text-[10px]">{data.tooltipDate}</p>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between gap-4">
              <span className="text-blue-600 font-semibold">Depresi:</span>
              <span>{meta.depression}%</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-purple-600 font-semibold">Kecemasan:</span>
              <span>{meta.anxiety}%</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-orange-600 font-semibold">Stres:</span>
              <span>{meta.stress}%</span>
            </div>
            <div className="border-t pt-1 mt-1 flex justify-between gap-4 font-medium">
              <span>Dominan:</span>
              <span>{meta.dominantLabel}</span>
            </div>
          </div>
        </div>
      )
    }
  }
  return null
}

export default function ExpertDashboard() {
  const [expertEmail, setExpertEmail] = useState("")
  const [loading, setLoading] = useState(true)
  const [historyRecords, setHistoryRecords] = useState<ExpertHistoryRecord[]>([])
  const [managedGroups, setManagedGroups] = useState<ManagedGroupSummary[]>([])
  const [historyLoading, setHistoryLoading] = useState(true)
  const [historyError, setHistoryError] = useState<string | null>(null)
  
  // Filter States
  const [timeWindowWeeks, setTimeWindowWeeks] = useState(12)
  const [selectedGroupKey, setSelectedGroupKey] = useState<string>("all")

  // Date Formatters
  const formatDate = (isoString: string) =>
    new Date(isoString).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
  const formatTime = (isoString: string) =>
    new Date(isoString).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })

  const fetchExpertHistory = async (authToken: string) => {
    setHistoryLoading(true)
    setHistoryError(null)
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API}/qdss/expert/history`, {
        headers: { Authorization: `Bearer ${authToken}` },
      })
      const payload = response.data ?? {}
      setHistoryRecords(Array.isArray(payload.records) ? payload.records : [])
      setManagedGroups(Array.isArray(payload.groups) ? payload.groups : [])
    } catch (error) {
      console.error("Failed to load expert history:", error)
      setHistoryRecords([])
      setManagedGroups([])
      setHistoryError("Gagal memuat histori diagnosa. Silakan coba lagi nanti.")
    } finally {
      setHistoryLoading(false)
    }
  }

  useEffect(() => {
    const token = sessionStorage.getItem("authToken")
    if (!token) {
      setHistoryLoading(false)
      setLoading(false)
      // Opsional: Redirect ke login jika perlu
      return
    }

    const initialize = async () => {
      try {
        const decodedToken: any = jwtDecode(token)
        const userRole = decodedToken.role
        const userEmail = decodedToken.sub

        if (userRole !== "expert") {
          console.log("User role is not expert:", userRole)
          setHistoryLoading(false)
          return
        }

        setExpertEmail(userEmail || "")
        await fetchExpertHistory(token)
      } catch (err) {
        console.error("Error decoding token:", err)
        setHistoryError("Gagal memuat histori diagnosa. Token tidak valid.")
        setHistoryLoading(false)
      } finally {
        setLoading(false)
      }
    }

    initialize()
  }, [])

  const groupLookup = useMemo(() => {
    const map = new Map<number, ManagedGroupSummary>()
    managedGroups.forEach((group) => {
      map.set(group.id, group)
    })
    return map
  }, [managedGroups])

  // --- Data Transformation for Chart ---
  const chartResult = useMemo(() => {
    if (!historyRecords.length) {
      return {
        chartData: [] as Array<Record<string, any>>,
        chartSeries: [] as Array<{ key: string; label: string; color: string }>,
        chartConfig: {} as ChartConfig,
      }
    }

    const validRecords = historyRecords.filter(
      (record) => record.group_id !== null && record.group_id !== undefined && record.created_at
    )
    if (!validRecords.length) {
      return {
        chartData: [] as Array<Record<string, any>>,
        chartSeries: [] as Array<{ key: string; label: string; color: string }>,
        chartConfig: {} as ChartConfig,
      }
    }

    // Sort kronologis
    const sortedRecords = [...validRecords].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )

    const groupMap = new Map<string, { key: string; label: string; color: string }>()

    const data = sortedRecords.map((record) => {
      const groupId = record.group_id as number
      const groupKey = `group-${groupId}`

      if (!groupMap.has(groupKey)) {
        const color = HISTORY_COLOR_PALETTE[groupMap.size % HISTORY_COLOR_PALETTE.length]
        const label = record.group_name && record.group_name.trim().length > 0
            ? record.group_name
            : groupLookup.get(groupId)?.name ?? `Grup ${groupId}`

        groupMap.set(groupKey, { key: groupKey, label, color })
      }

      const groupMeta = groupMap.get(groupKey)!
      const createdAt = new Date(record.created_at)

      const depression = normalizeScore(record.depression_score)
      const anxiety = normalizeScore(record.anxiety_score)
      const stress = normalizeScore(record.stress_score)
      
      const severityVectors = [
        { label: "Depresi", value: depression },
        { label: "Kecemasan", value: anxiety },
        { label: "Stres", value: stress },
      ]
      // Cari nilai tertinggi untuk plot grafik
      const dominant = severityVectors.reduce((acc, curr) => (curr.value >= acc.value ? curr : acc))

      const shortLabel = new Intl.DateTimeFormat("id-ID", {
        day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
      }).format(createdAt)
      
      const longLabel = new Intl.DateTimeFormat("id-ID", {
        dateStyle: "long", timeStyle: "short",
      }).format(createdAt)

      const point: Record<string, unknown> = {
        label: shortLabel,
        timestamp: createdAt.getTime(),
        tooltipDate: longLabel,
      }

      // Assign nilai ke key spesifik grup
      point[groupKey] = dominant.value
      
      // Simpan metadata untuk tooltip
      point[`${groupKey}__meta`] = {
        groupName: groupMeta.label,
        userName: record.user_name,
        userEmail: record.user_email,
        depression: Math.round(depression),
        anxiety: Math.round(anxiety),
        stress: Math.round(stress),
        dominantLabel: dominant.label,
      }

      return point
    })

    const config: ChartConfig = {}
    for (const meta of groupMap.values()) {
      config[meta.key] = { label: meta.label, color: meta.color }
    }

    const series = Array.from(groupMap.values())

    return {
      chartData: data,
      chartSeries: series,
      chartConfig: config,
    }
  }, [historyRecords, groupLookup])

  const { chartData, chartSeries, chartConfig } = chartResult
  const hasChartData = chartData.length > 0 && chartSeries.length > 0

  // Validasi selectedGroupKey agar tidak nyangkut di grup yang sudah tidak ada
  useEffect(() => {
    if (selectedGroupKey === "all") return
    const exists = chartSeries.some((series) => series.key === selectedGroupKey)
    if (!exists) {
      setSelectedGroupKey("all")
    }
  }, [chartSeries, selectedGroupKey])

  // Filter Data berdasarkan Waktu (Slider)
  const filteredChartData = useMemo(() => {
    if (!chartData.length) return []
    const windowMs = timeWindowWeeks * 7 * 24 * 60 * 60 * 1000
    const threshold = Date.now() - windowMs
    return chartData.filter((point) => {
      const rawTimestamp = point.timestamp
      const timestamp = typeof rawTimestamp === "number" ? rawTimestamp : new Date(rawTimestamp ?? 0).getTime()
      return Number.isFinite(timestamp) && timestamp >= threshold
    })
  }, [chartData, timeWindowWeeks])

  // Filter Series (Lines) berdasarkan Dropdown
  const activeSeries = useMemo(() => {
    if (selectedGroupKey === "all") {
      return chartSeries
    }
    const target = chartSeries.find((series) => series.key === selectedGroupKey)
    return target ? [target] : []
  }, [chartSeries, selectedGroupKey])

  const activeChartConfig = useMemo<ChartConfig>(() => {
    const config: ChartConfig = {}
    activeSeries.forEach((series) => {
      const baseEntry = chartConfig[series.key]
      if (baseEntry) {
        config[series.key] = {
          label: baseEntry.label ?? series.label,
          color: baseEntry.color ?? series.color,
        }
      } else {
        config[series.key] = { label: series.label, color: series.color }
      }
    })
    return config
  }, [activeSeries, chartConfig])

  const hasFilteredData = filteredChartData.length > 0 && activeSeries.length > 0

  const resolveGroupLabel = (key: string, fallback: string) => {
    const entry = chartConfig[key]
    if (entry?.label) return entry.label as string
    return fallback
  }

  const selectedGroupLabel = useMemo(() => {
    if (selectedGroupKey === "all") return "Semua Grup"
    return resolveGroupLabel(selectedGroupKey, selectedGroupKey)
  }, [selectedGroupKey, chartConfig])

  // Filter Records untuk Tabel
  const filteredHistoryRecords = useMemo(() => {
    if (!historyRecords.length) return []
    const windowMs = timeWindowWeeks * 7 * 24 * 60 * 60 * 1000
    const threshold = Date.now() - windowMs

    const parsedId = selectedGroupKey.startsWith("group-")
      ? Number(selectedGroupKey.replace("group-", ""))
      : NaN

    return historyRecords.filter((record) => {
      const timestamp = new Date(record.created_at).getTime()
      if (!Number.isFinite(timestamp) || timestamp < threshold) {
        return false
      }
      if (selectedGroupKey === "all" || Number.isNaN(parsedId)) {
        return true
      }
      return record.group_id === parsedId
    })
  }, [historyRecords, timeWindowWeeks, selectedGroupKey])

  const summaryStats = useMemo(() => {
    const userSet = new Set<number>()
    const groupSet = new Set<number>()
    filteredHistoryRecords.forEach((record) => {
      userSet.add(record.user_id)
      if (record.group_id !== null) groupSet.add(record.group_id)
    })
    return {
      totalSessions: filteredHistoryRecords.length,
      uniqueUsers: userSet.size,
      activeGroups: groupSet.size,
    }
  }, [filteredHistoryRecords])

  const handleLogout = () => {
    sessionStorage.removeItem("authToken")
    window.location.href = "/"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground text-sm">Memuat dashboard pakar...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard Pakar</h1>
            <p className="text-sm text-muted-foreground">{expertEmail}</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2 bg-transparent">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-2">Kelola Sistem Pakar</h2>
          <p className="text-muted-foreground">
            Lakukan konfigurasi untuk sistem deteksi kesehatan mental berbasis DASS-21 dan DASS-42
          </p>
        </div>

        <Tabs defaultValue="history" className="w-full space-y-6">
          <TabsList className="grid w-full grid-cols-1 gap-2 rounded-xl border border-border/50 bg-muted/40 p-1 sm:grid-cols-5">
            <TabsTrigger value="history" className="w-full rounded-lg text-sm font-semibold">Histori Diagnosa</TabsTrigger>
            <TabsTrigger value="ranking" className="w-full rounded-lg text-sm font-semibold">Ranking Pakar</TabsTrigger>
            <TabsTrigger value="preference" className="w-full rounded-lg text-sm font-semibold">Preferensi DASS-21</TabsTrigger>
            <TabsTrigger value="profile" className="w-full rounded-lg text-sm font-semibold">Profil & Pengaruh</TabsTrigger>
            <TabsTrigger value="ruleset" className="w-full rounded-lg text-sm font-semibold">Ruleset DASS-42</TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="space-y-8">
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Insight Diagnosa Grup
                </CardTitle>
                <CardDescription>
                  Visualisasi sesi pengguna yang menggunakan grup Anda.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {historyLoading ? (
                  <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
                    Memuat histori grup...
                  </div>
                ) : historyError ? (
                  <div className="flex h-[280px] items-center justify-center text-sm text-destructive">
                    {historyError}
                  </div>
                ) : !managedGroups.length ? (
                  <div className="text-center py-12 rounded-lg border border-dashed border-border/50 bg-muted/20">
                     <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                        <Users className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-1">Belum tergabung dalam grup</h3>
                      <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                        Bergabunglah dengan grup pakar untuk memantau histori pengguna.
                      </p>
                  </div>
                ) : !hasChartData ? (
                  <div className="text-center py-12 rounded-lg border border-dashed border-border/50 bg-muted/20">
                    <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                      <ClipboardList className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">Belum ada data</h3>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                      Pengguna belum melakukan deteksi menggunakan grup Anda.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                          <span>Rentang waktu</span>
                          <span>{timeWindowWeeks} minggu</span>
                        </div>
                        <Slider
                          value={[timeWindowWeeks]}
                          min={1} max={24} step={1}
                          onValueChange={(value) => setTimeWindowWeeks(value[0] ?? timeWindowWeeks)}
                          className="w-full"
                        />
                      </div>
                      <div className="w-full md:max-w-xs space-y-2">
                        <Label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                          Filter grup pakar
                        </Label>
                        <Select value={selectedGroupKey} onValueChange={(value) => setSelectedGroupKey(value)}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Semua grup" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Semua grup</SelectItem>
                            {chartSeries.map((series) => (
                              <SelectItem key={series.key} value={series.key}>
                                {series.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {hasFilteredData ? (
                      <ChartContainer config={activeChartConfig} className="h-[360px] w-full">
                        <LineChart data={filteredChartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="label" />
                          <YAxis domain={[0, 100]} />
                          <ChartTooltip content={<CustomTooltip />} />
                          {activeSeries.map((series) => (
                            <Line 
                                key={series.key} 
                                type="monotone" 
                                dataKey={series.key} 
                                stroke={series.color} 
                                strokeWidth={2}
                                dot={true}
                                connectNulls={true} // PENTING: Agar garis tidak putus jika data sparse
                            />
                          ))}
                        </LineChart>
                      </ChartContainer>
                    ) : (
                      <div className="text-center py-12 rounded-lg border border-dashed border-border/50 bg-muted/20">
                        <TrendingUp className="w-8 h-8 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-1">Data tidak ditemukan</h3>
                        <p className="text-sm text-muted-foreground">Tidak ada sesi untuk filter saat ini.</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Histori Diagnosa Pengguna
                </CardTitle>
                <CardDescription>
                  Daftar sesi pengguna berdasarkan grup yang Anda kelola.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {historyLoading ? (
                   <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">Loading...</div>
                ) : !filteredHistoryRecords.length ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">Belum ada histori.</div>
                ) : (
                  <>
                    <div className="flex flex-wrap gap-3 text-xs font-semibold text-muted-foreground mb-4">
                      <Badge variant="outline">Total sesi: {summaryStats.totalSessions}</Badge>
                      <Badge variant="outline">Pengguna unik: {summaryStats.uniqueUsers}</Badge>
                      <Badge variant="outline">Grup aktif: {summaryStats.activeGroups}</Badge>
                    </div>
                    <div className="overflow-x-auto rounded-md border">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-muted/40 text-muted-foreground uppercase text-xs">
                          <tr>
                            <th className="px-6 py-3">Tanggal</th>
                            <th className="px-6 py-3">Pengguna</th>
                            <th className="px-6 py-3">Grup</th>
                            <th className="px-6 py-3">Tipe</th>
                            <th className="px-6 py-3">Dominan</th>
                            <th className="px-6 py-3 text-center">Skor (D / A / S)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                          {filteredHistoryRecords.map((record) => {
                            const normDep = normalizeScore(record.depression_score)
                            const normAnx = normalizeScore(record.anxiety_score)
                            const normStr = normalizeScore(record.stress_score)
                            const dominant = getDominantSymptomStyle(normDep, normAnx, normStr)
                            const isDass21 = record.type === "21" || record.type === "DASS-21"
                            const groupLabel = record.group_name || groupLookup.get(record.group_id ?? -1)?.name || "-"

                            return (
                              <tr key={record.id} className="hover:bg-muted/30 transition-colors">
                                <td className="px-6 py-4">
                                  <div className="flex flex-col">
                                    <span className="font-medium text-foreground">{formatDate(record.created_at)}</span>
                                    <span className="text-xs text-muted-foreground">{formatTime(record.created_at)}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex flex-col">
                                    <span className="font-medium text-foreground">{record.user_name || record.user_email}</span>
                                    <span className="text-xs text-muted-foreground">{record.user_email}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-sm">{groupLabel}</td>
                                <td className="px-6 py-4">
                                  <Badge variant="outline" className="font-mono">DASS-{record.type}</Badge>
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${dominant.className}`}>
                                    {dominant.label}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <div className="flex items-center justify-center gap-3 font-medium text-xs">
                                    <div className="flex flex-col">
                                      <span className="text-blue-600">{isDass21 ? formatDass21Score(record.depression_score) : (record.depression_score ?? "-")}</span>
                                      <span className="text-[10px] text-muted-foreground">Dep</span>
                                    </div>
                                    <div className="w-px h-6 bg-border"></div>
                                    <div className="flex flex-col">
                                      <span className="text-purple-600">{isDass21 ? formatDass21Score(record.anxiety_score) : (record.anxiety_score ?? "-")}</span>
                                      <span className="text-[10px] text-muted-foreground">Ans</span>
                                    </div>
                                    <div className="w-px h-6 bg-border"></div>
                                    <div className="flex flex-col">
                                      <span className="text-orange-600">{isDass21 ? formatDass21Score(record.stress_score) : (record.stress_score ?? "-")}</span>
                                      <span className="text-[10px] text-muted-foreground">Str</span>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ranking" className="space-y-4">
            <RankingModule />
          </TabsContent>
          <TabsContent value="preference" className="space-y-4">
            <PreferenceModule />
          </TabsContent>
          <TabsContent value="profile" className="space-y-4">
            <ProfileInfluenceModule />
          </TabsContent>
          <TabsContent value="ruleset" className="space-y-4">
            <RulesetModule />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}