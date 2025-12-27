"use client"

import { useState, useEffect, useMemo } from "react"
import { LogOut, Calendar, TrendingUp, Activity, ClipboardList, ArrowRight, AlertCircle, Trash2, ChevronLeft, ChevronRight, BarChart3 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { jwtDecode } from "jwt-decode"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart as RechartsLineChart, Line, CartesianGrid, XAxis, YAxis, Legend } from "recharts"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import axios from "axios"

// --- Interfaces ---
interface HistoryItem {
    id: number
    created_at: string
    type: string
    depression_score: number
    anxiety_score: number
    stress_score: number
    highest_severity: string
    group_id?: number | null
    group_name?: string | null
}

interface ExpertGroup {
    id: number
    name: string
    description: string
    member_count?: number
}

// --- Helpers ---

// 1. Helper Warna Severity (Khusus DASS-42)
const getSeverityColor = (level: string): string => {
    const s = level?.toLowerCase() || ""
    if (s === "normal") return "bg-green-100 text-green-800 border-green-300"
    if (s === "mild") return "bg-blue-100 text-blue-800 border-blue-300"
    if (s === "moderate") return "bg-yellow-100 text-yellow-800 border-yellow-300"
    if (s === "severe") return "bg-orange-100 text-orange-800 border-orange-300"
    if (s === "extremely severe") return "bg-red-100 text-red-800 border-red-300"
    return "bg-gray-100 text-gray-800 border-gray-300"
}

// 2. Helper Dominant Symptom
const getDominantSymptom = (d: number, a: number, s: number) => {
    if (d >= a && d >= s) return { label: "Depresi", color: "blue" }
    if (a >= d && a >= s) return { label: "Ansietas", color: "purple" }
    return { label: "Stres", color: "amber" }
}

// 3. Helper Format Skor (Handling Decimal vs Integer untuk DASS-21)
const formatDass21Score = (score: number) => {
    // Jika skor <= 1 (misal 0.489), kita asumsikan itu desimal mentah -> kali 100
    // Jika skor > 1 (misal 49), kita asumsikan itu sudah persen integer -> biarkan
    if (score <= 1 && score > 0) {
        return (score * 100).toFixed(2) + "%";
    }
    // Jika integer atau 0
    return score + "%";
}

// --- Constants for DAS Chart ---
const DAS_COLORS = {
    depression: "#2563eb",
    anxiety: "#8b5cf6",
    stress: "#f97316",
}

const DAS_CHART_CONFIG: ChartConfig = {
    depression: { label: "Depresi", color: DAS_COLORS.depression },
    anxiety: { label: "Ansietas", color: DAS_COLORS.anxiety },
    stress: { label: "Stres", color: DAS_COLORS.stress },
}

const DAS_SERIES = [
    { key: "depression", label: "Depresi", color: DAS_COLORS.depression },
    { key: "anxiety", label: "Ansietas", color: DAS_COLORS.anxiety },
    { key: "stress", label: "Stres", color: DAS_COLORS.stress },
]


export default function UserDashboardPage() {
    const router = useRouter()
    
    // --- State ---
    const [userEmail, setUserEmail] = useState("")
    const [loading, setLoading] = useState(true)
    const [historyRecords, setHistoryRecords] = useState<HistoryItem[]>([])
    
    // State untuk Delete
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    // State untuk Pagination
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 5

    // State untuk Grup
    const [groups, setGroups] = useState<ExpertGroup[]>([])

    // State untuk Modal Pilih Grup
    const [showGroupModal, setShowGroupModal] = useState(false)
    const [loadingGroups, setLoadingGroups] = useState(false)

    // State untuk filter visualisasi
    const [timeWindowWeeks, setTimeWindowWeeks] = useState(12)
    const [selectedGroupKey, setSelectedGroupKey] = useState<string>("all")

    // --- Effects ---
    useEffect(() => {
        const token = sessionStorage.getItem("authToken")
        
        if (!token) {
            router.push("/auth/login")
            return
        }

        const fetchData = async () => {
            try {
                // Decode Token
                const payload: any = jwtDecode(token)
                
                // Cek Expired
                if (payload.exp * 1000 < Date.now()) {
                    sessionStorage.removeItem("authToken")
                    router.push("/auth/login")
                    return
                }

                if (payload.role === "expert") {
                    router.push("/expert/dashboard")
                    return
                }

                setUserEmail(payload.sub || "Pengguna")

                // Fetch Data Real
                console.log("Fetching history data...")
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API}/qdss/history`, {
                    headers: { Authorization: `Bearer ${token}` }
                })

                console.log("History Data Received:", response.data)
                setHistoryRecords(response.data)

                // Fetch Groups
                const groupsResponse = await axios.get(`${process.env.NEXT_PUBLIC_API}/groups`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                setGroups(groupsResponse.data || [])

            } catch (err) {
                console.error("Error loading dashboard:", err)
                if (axios.isAxiosError(err) && err.response?.status === 401) {
                    sessionStorage.removeItem("authToken")
                    router.push("/auth/login")
                }
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [router])


    // --- Handlers ---
    const handleLogout = () => {
        sessionStorage.removeItem("authToken")
        router.push("/")
    }

    const handleStartDass21 = async () => {
        setLoadingGroups(true)
        try {
            const token = sessionStorage.getItem("authToken")
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API}/groups`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setGroups(response.data || [])
            setShowGroupModal(true)
        } catch (err) {
            console.error("Failed to load groups", err)
            alert("Gagal memuat daftar grup. Silakan coba lagi.")
        } finally {
            setLoadingGroups(false)
        }
    }

    const handleSelectGroup = (groupId: number) => {
        setShowGroupModal(false)
        router.push(`/detection/dass21?groupId=${groupId}`)
    }

    const handleDeleteHistory = async (historyId: number) => {
        setIsDeleting(true)
        try {
            const token = sessionStorage.getItem("authToken")
            if (!token) {
                router.push("/auth/login")
                return
            }

            await axios.delete(
                `${process.env.NEXT_PUBLIC_API}/qdss/history/${historyId}`,
                { headers: { "Authorization": `Bearer ${token}` } }
            )

            // Update UI setelah hapus
            setHistoryRecords(prevData => prevData.filter(record => record.id !== historyId))
            setDeleteConfirm(null)
            
            // Reset page jika item di halaman terakhir habis
            if (currentItems.length === 1 && currentPage > 1) {
                setCurrentPage(prev => prev - 1)
            }

        } catch (error: any) {
            console.error("Delete failed:", error)
            alert("Gagal menghapus riwayat. Silakan coba lagi.")
        } finally {
            setIsDeleting(false)
        }
    }

    // --- Pagination Logic ---
    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    const currentItems = historyRecords.slice(indexOfFirstItem, indexOfLastItem)
    const totalPages = Math.ceil(historyRecords.length / itemsPerPage)

    const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages))
    const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1))

    // --- Date Formatting ---
    const formatDate = (isoString: string) => {
        return new Date(isoString).toLocaleDateString("id-ID", {
            day: "numeric", month: "short", year: "numeric"
        })
    }
    const formatTime = (isoString: string) => {
        return new Date(isoString).toLocaleTimeString("id-ID", {
            hour: "2-digit", minute: "2-digit"
        })
    }

    const { chartData, chartSeries, chartConfig } = useMemo(() => {
        if (!historyRecords.length) {
            return {
                chartData: [] as Array<Record<string, any>>,
                chartSeries: [] as Array<{ key: string; label: string; color: string }>,
                chartConfig: {} as ChartConfig,
            }
        }

        const sortedRecords = [...historyRecords].sort(
            (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        )

        const palette = [
            "#4f46e5",
            "#0ea5e9",
            "#22c55e",
            "#facc15",
            "#f97316",
            "#14b8a6",
            "#ec4899",
            "#a855f7",
        ]

        const groupMap = new Map<string, { key: string; label: string; color: string }>()

        const normalizeScore = (score: number | null | undefined) => {
            if (score === null || score === undefined) {
                return 0
            }
            const numeric = Number(score)
            if (!Number.isFinite(numeric)) {
                return 0
            }
            if (numeric > 0 && numeric <= 1) {
                return numeric * 100
            }
            return numeric
        }

        const data = sortedRecords.map((record) => {
            const groupKey =
                record.group_id !== undefined && record.group_id !== null
                    ? `group-${record.group_id}`
                    : "group-global"

            if (!groupMap.has(groupKey)) {
                const color = palette[groupMap.size % palette.length]
                const label =
                    record.group_name && record.group_name.trim().length > 0
                        ? record.group_name
                        : record.group_id !== undefined && record.group_id !== null
                            ? `Grup ${record.group_id}`
                            : "Global"

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
            const dominant = severityVectors.reduce((acc, curr) => (curr.value >= acc.value ? curr : acc))

            const shortLabel = new Intl.DateTimeFormat("id-ID", {
                day: "2-digit",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
            }).format(createdAt)
            const longLabel = new Intl.DateTimeFormat("id-ID", {
                dateStyle: "long",
                timeStyle: "short",
            }).format(createdAt)

            const point: Record<string, unknown> = {
                label: shortLabel,
                timestamp: createdAt.getTime(),
                tooltipDate: longLabel,
            }

            const highest = dominant.value
            point[groupKey] = highest
            point[`${groupKey}__meta`] = {
                groupName: groupMeta.label,
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
            chartData: data as Array<Record<string, any>>,
            chartSeries: series,
            chartConfig: config,
        }
    }, [historyRecords])

    const hasChartData = chartData.length > 0 && chartSeries.length > 0

    const resolveGroupLabel = (key: string, fallback: string) => {
        const entry = chartConfig[key as keyof ChartConfig]
        return entry?.label ?? fallback
    }

    useEffect(() => {
        if (selectedGroupKey === "all") {
            return
        }
        const exists = chartSeries.some((series) => series.key === selectedGroupKey)
        if (!exists) {
            setSelectedGroupKey("all")
        }
    }, [chartSeries, selectedGroupKey])

    const filteredChartData = useMemo(() => {
        if (!chartData.length) {
            return []
        }
        const windowMs = timeWindowWeeks * 7 * 24 * 60 * 60 * 1000
        const threshold = Date.now() - windowMs
        
        let data = chartData.filter((point) => {
            const rawTimestamp = point.timestamp
            const timestamp = typeof rawTimestamp === "number"
                ? rawTimestamp
                : new Date(rawTimestamp ?? 0).getTime()
            return Number.isFinite(timestamp) && timestamp >= threshold
        })

        if (selectedGroupKey !== "all") {
            // Filter to only points that have data for the selected group
            data = data.filter((point) => point[selectedGroupKey] !== undefined)
            
            // Transform to DAS format
            data = data.map((point) => {
                const meta = point[`${selectedGroupKey}__meta`] as any
                return {
                    label: point.label,
                    timestamp: point.timestamp,
                    tooltipDate: point.tooltipDate,
                    depression: meta?.depression ?? 0,
                    anxiety: meta?.anxiety ?? 0,
                    stress: meta?.stress ?? 0,
                }
            })
        }

        return data
    }, [chartData, timeWindowWeeks, selectedGroupKey])

    const activeSeries = useMemo(() => {
        if (selectedGroupKey === "all") {
            return chartSeries
        }
        return DAS_SERIES
    }, [chartSeries, selectedGroupKey])

    const activeChartConfig = useMemo<ChartConfig>(() => {
        if (selectedGroupKey === "all") {
            const config: ChartConfig = {}
            activeSeries.forEach((series) => {
                const baseEntry = chartConfig[series.key as keyof typeof chartConfig]
                if (baseEntry) {
                    config[series.key] = {
                        label: baseEntry.label ?? series.label,
                        color: (baseEntry as { color?: string }).color ?? series.color,
                    }
                } else {
                    config[series.key] = { label: series.label, color: series.color }
                }
            })
            return config
        }
        return DAS_CHART_CONFIG
    }, [activeSeries, chartConfig, selectedGroupKey])

    const hasFilteredData = filteredChartData.length > 0 && activeSeries.length > 0

    const selectedGroupLabel = useMemo(() => {
        if (selectedGroupKey === "all") {
            return "Semua Grup"
        }
        const entry = chartConfig[selectedGroupKey as keyof typeof chartConfig]
        if (entry?.label && typeof entry.label === "string") {
            return entry.label
        }
        const fallback = chartSeries.find((series) => series.key === selectedGroupKey)?.label
        return fallback ?? selectedGroupKey
    }, [selectedGroupKey, chartConfig, chartSeries])

    const advancedInsights = useMemo(() => {
        if (!hasFilteredData) {
            return null
        }
        const points: Array<{
            groupKey: string
            groupLabel: string
            timestamp: number
            value: number
            meta?: Record<string, any>
        }> = []

        filteredChartData.forEach((entry) => {
            activeSeries.forEach((series) => {
                const rawValue = entry[series.key]
                const value = typeof rawValue === "number" ? rawValue : Number(rawValue)
                if (!Number.isFinite(value)) {
                    return
                }
                const rawTimestamp = entry.timestamp
                const timestamp = typeof rawTimestamp === "number"
                    ? rawTimestamp
                    : new Date(rawTimestamp ?? 0).getTime()
                if (!Number.isFinite(timestamp)) {
                    return
                }
                points.push({
                    groupKey: series.key,
                    groupLabel: series.label,
                    timestamp,
                    value,
                    meta: entry[`${series.key}__meta`] as Record<string, any> | undefined,
                })
            })
        })

        if (!points.length) {
            return null
        }

        points.sort((a, b) => a.timestamp - b.timestamp)
        const sessionCount = points.length
        const averageIntensity = points.reduce((sum, item) => sum + item.value, 0) / sessionCount
        const latest = points[sessionCount - 1]
        const earliest = points[0]
        const trendDelta = Math.round(latest.value - earliest.value)

        const dominantCounts = points.reduce((acc, item) => {
            const label = item.meta?.dominantLabel ?? "Tidak diketahui"
            acc[label] = (acc[label] ?? 0) + 1
            return acc
        }, {} as Record<string, number>)

        const dominantLabel = Object.entries(dominantCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Tidak diketahui"

        const trendLabel =
            Math.abs(trendDelta) <= 4
                ? "Stabil"
                : trendDelta > 0
                    ? "Meningkat"
                    : "Menurun"

        const recommendations: string[] = []

        if (latest.value >= 75) {
            recommendations.push("Tingkat gejala terbaru berada pada kategori tinggi. Pertimbangkan konsultasi lanjutan dengan tenaga profesional.")
        } else if (latest.value >= 55) {
            recommendations.push("Intensitas gejala terbaru cukup signifikan. Jadwalkan pemantauan lebih sering dan perkuat strategi coping Anda.")
        } else {
            recommendations.push("Gejala berada pada rentang moderat. Pertahankan kebiasaan sehat dan lakukan evaluasi berkala.")
        }

        if (trendLabel === "Meningkat" && trendDelta >= 10) {
            recommendations.push("Grafik menunjukkan tren peningkatan. Coba identifikasi pemicu utama dan diskusikan strategi mitigasi.")
        } else if (trendLabel === "Menurun" && trendDelta <= -10) {
            recommendations.push("Ada perbaikan yang konsisten. Catat intervensi yang efektif agar dapat dipertahankan.")
        }

        if (dominantLabel === "Ansietas") {
            recommendations.push("Fokus pada teknik relaksasi seperti pernapasan dalam atau grounding untuk mereduksi ansietas.")
        } else if (dominantLabel === "Depresi") {
            recommendations.push("Pertimbangkan aktivitas terstruktur dan dukungan sosial untuk membantu mengelola gejala depresi.")
        } else if (dominantLabel === "Stres") {
            recommendations.push("Sisihkan waktu untuk mindfulness singkat atau jeda terjadwal guna menekan dampak stres.")
        }

        const uniqueRecommendations = Array.from(new Set(recommendations)).slice(0, 3)

        return {
            sessionCount,
            averageIntensity,
            dominantLabel,
            trendLabel,
            trendDelta,
            latestValue: latest.value,
            latestTimestamp: latest.timestamp,
            latestGroup: latest.meta?.groupName ?? latest.groupLabel,
            recommendations: uniqueRecommendations,
        }
    }, [activeSeries, filteredChartData, hasFilteredData])


    // --- Render ---
    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-muted-foreground text-sm">Memuat data anda...</p>
                </div>
            </div>
        )
    }

    return (
        <main className="min-h-screen bg-background pb-10">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Dashboard Saya</h1>
                        <p className="text-sm text-muted-foreground">Login sebagai: {userEmail}</p>
                    </div>
                    <Button 
                        variant="outline" size="sm" onClick={handleLogout} 
                        className="gap-2 bg-transparent hover:bg-muted"
                    >
                        <LogOut className="w-4 h-4" /> Keluar
                    </Button>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <Tabs defaultValue="overview" className="w-full space-y-6">
                    <TabsList className="grid w-full grid-cols-1 gap-2 rounded-xl border border-border/50 bg-muted/40 p-1 sm:grid-cols-2">
                        <TabsTrigger value="overview" className="w-full rounded-lg text-sm font-semibold data-[state=active]:bg-background data-[state=active]:text-primary">
                            Ringkasan
                        </TabsTrigger>
                        <TabsTrigger value="insights" className="w-full rounded-lg text-sm font-semibold data-[state=active]:bg-background data-[state=active]:text-primary">
                            Visualisasi Histori
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-8">
                        {/* Section 1: Pilihan Tes */}
                        <section>
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <Activity className="w-5 h-5 text-primary" /> Mulai Deteksi Baru
                            </h2>
                            <div className="grid gap-6 md:grid-cols-2">
                                {/* Card DASS-21 */}
                                <Card className="hover:shadow-lg transition-all border-l-4 border-l-blue-500 bg-linear-to-br from-background to-blue-50/20">
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="text-lg text-blue-700">DASS-21 (Cepat)</CardTitle>
                                                <CardDescription className="mt-1">Skrining ringkas 21 pertanyaan</CardDescription>
                                            </div>
                                            <Badge variant="secondary" className="bg-blue-100 text-blue-700">Populer</Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground">
                                            Cocok untuk pemeriksaan rutin. Mengukur tingkat stres, kecemasan, dan depresi dalam waktu singkat (~3 menit).
                                        </p>
                                    </CardContent>
                                    <CardFooter>
                                        <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleStartDass21} disabled={loadingGroups}>
                                            {loadingGroups ? "Memuat Grup..." : "Mulai DASS-21"} <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </CardFooter>
                                </Card>

                                {/* Card DASS-42 */}
                                <Card className="hover:shadow-lg transition-all border-l-4 border-l-purple-500 bg-linear-to-br from-background to-purple-50/20">
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="text-lg text-purple-700">DASS-42 (Lengkap)</CardTitle>
                                                <CardDescription className="mt-1">Analisis mendalam 42 pertanyaan</CardDescription>
                                            </div>
                                            <Badge variant="secondary" className="bg-purple-100 text-purple-700">Detail</Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground">
                                            Memberikan gambaran klinis yang lebih komprehensif. Direkomendasikan jika Anda memiliki keluhan spesifik (~7 menit).
                                        </p>
                                    </CardContent>
                                    <CardFooter>
                                        <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => router.push("/detection/dass42")}>
                                            Mulai DASS-42 <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </div>
                        </section>

                        {/* Section 2: Riwayat Deteksi */}
                        <Card className="border-border/50 shadow-sm">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <Calendar className="w-5 h-5 text-primary" />
                                            Riwayat Hasil
                                        </CardTitle>
                                        <CardDescription className="mt-1">
                                            Total: {historyRecords.length} kali deteksi
                                        </CardDescription>
                                    </div>
                                    <Badge variant="outline" className="hidden sm:flex">
                                        <TrendingUp className="w-3 h-3 mr-1" /> Data Terbaru
                                    </Badge>
                                </div>
                            </CardHeader>

                            <CardContent>
                                {historyRecords.length === 0 ? (
                                    <div className="text-center py-12 rounded-lg border border-dashed border-border/50 bg-muted/20">
                                        <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                                            <AlertCircle className="w-8 h-8 text-muted-foreground" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-foreground mb-1">Belum Ada Data</h3>
                                        <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
                                            Hasil deteksi Anda akan muncul di sini setelah Anda menyelesaikan tes pertama.
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="overflow-x-auto rounded-md border">
                                            <table className="w-full text-sm text-left">
                                                <thead className="bg-muted/40 text-muted-foreground uppercase text-xs">
                                                    <tr>
                                                        <th className="px-6 py-3">Tanggal</th>
                                                        <th className="px-6 py-3">Tipe</th>
                                                        <th className="px-6 py-3">Grup Pakar</th>
                                                        <th className="px-6 py-3">Dominan</th>
                                                        <th className="px-6 py-3 text-center">Skor (D / A / S)</th>
                                                        {/* <th className="px-6 py-3">Status / Severity</th> */}
                                                        <th className="px-6 py-3 text-center">Aksi</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-border/50">
                                                    {currentItems.map((record) => {
                                                        const dominant = getDominantSymptom(record.depression_score, record.anxiety_score, record.stress_score)
                                                        // Cek apakah tipe 21 atau 42
                                                        const isDass21 = record.type === "21" || record.type === "DASS-21"

                                                        return (
                                                            <tr key={record.id} className="hover:bg-muted/30 transition-colors">
                                                                <td className="px-6 py-4">
                                                                    <div className="flex flex-col">
                                                                        <span className="font-medium text-foreground">{formatDate(record.created_at)}</span>
                                                                        <span className="text-xs text-muted-foreground">{formatTime(record.created_at)}</span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <Badge variant="outline" className="font-mono">
                                                                        DASS-{record.type}
                                                                    </Badge>
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <span className="text-sm text-foreground">
                                                                        {record.group_name ? record.group_name : "Global"}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${dominant.color}-100 text-${dominant.color}-800`}>
                                                                        {dominant.label}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-4 text-center">
                                                                    {/* LOGIKA FORMAT SKOR: Jika DASS-21 pakai Persen, Jika 42 pakai Angka Biasa */}
                                                                    <div className="flex items-center justify-center gap-3 font-medium text-xs">
                                                                        <div title="Depresi" className="flex flex-col">
                                                                            <span className="text-blue-600">
                                                                                {isDass21 ? formatDass21Score(record.depression_score) : record.depression_score}
                                                                            </span>
                                                                            <span className="text-[10px] text-muted-foreground">Dep</span>
                                                                        </div>
                                                                        <div className="w-px h-6 bg-border"></div>
                                                                        <div title="Ansietas" className="flex flex-col">
                                                                            <span className="text-purple-600">
                                                                                {isDass21 ? formatDass21Score(record.anxiety_score) : record.anxiety_score}
                                                                            </span>
                                                                            <span className="text-[10px] text-muted-foreground">Ans</span>
                                                                        </div>
                                                                        <div className="w-px h-6 bg-border"></div>
                                                                        <div title="Stres" className="flex flex-col">
                                                                            <span className="text-orange-600">
                                                                                {isDass21 ? formatDass21Score(record.stress_score) : record.stress_score}
                                                                            </span>
                                                                            <span className="text-[10px] text-muted-foreground">Str</span>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                {/* <td className="px-6 py-4">
                                                                    
                                                                    {isDass21 ? (
                                                                        <span className="text-muted-foreground text-center block">-</span>
                                                                    ) : (
                                                                        <span className={`inline-block px-3 py-1 rounded-md text-xs font-semibold border ${getSeverityColor(record.highest_severity)}`}>
                                                                            {record.highest_severity}
                                                                        </span>
                                                                    )}
                                                                </td> */}
                                                                <td className="px-6 py-4 text-center">
                                                                    <Button
                                                                        variant="ghost" size="sm"
                                                                        onClick={() => setDeleteConfirm(record.id)}
                                                                        className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                                        disabled={isDeleting}
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </Button>
                                                                </td>
                                                            </tr>
                                                        )
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Pagination Controls */}
                                        {historyRecords.length > itemsPerPage && (
                                            <div className="flex items-center justify-between mt-4">
                                                <p className="text-sm text-muted-foreground">
                                                    Halaman {currentPage} dari {totalPages}
                                                </p>
                                                <div className="flex gap-2">
                                                    <Button 
                                                        variant="outline" size="sm" 
                                                        onClick={prevPage} disabled={currentPage === 1}
                                                        className="gap-1"
                                                    >
                                                        <ChevronLeft className="w-4 h-4" /> Prev
                                                    </Button>
                                                    <Button 
                                                        variant="outline" size="sm" 
                                                        onClick={nextPage} disabled={currentPage === totalPages}
                                                        className="gap-1"
                                                    >
                                                        Next <ChevronRight className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="insights">
                        <Card className="border-border/50 shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-primary" />
                                    Tren Diagnosa
                                </CardTitle>
                                <CardDescription>
                                    Visualisasi histori deteksi berdasarkan grup pakar yang digunakan.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {!hasChartData ? (
                                    <div className="text-center py-12 rounded-lg border border-dashed border-border/50 bg-muted/20">
                                        <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                                            <ClipboardList className="w-8 h-8 text-muted-foreground" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-foreground mb-1">Belum Ada Histori</h3>
                                        <p className="text-sm text-muted-foreground mb-2 max-w-sm mx-auto">
                                            Selesaikan kuisioner untuk melihat grafik perkembangan berdasarkan grup pakar.
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
                                                    min={1}
                                                    max={24}
                                                    step={1}
                                                    onValueChange={(value) => setTimeWindowWeeks(value[0] ?? timeWindowWeeks)}
                                                    className="w-full"
                                                    aria-label="Rentang waktu histori"
                                                />
                                                <p className="text-xs text-muted-foreground">
                                                    Menampilkan sesi dalam {timeWindowWeeks === 1 ? "1 minggu" : `${timeWindowWeeks} minggu`} terakhir.
                                                </p>
                                            </div>
                                            <div className="w-full md:max-w-xs space-y-2">
                                                <Label htmlFor="group-filter" className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                                    Filter grup pakar
                                                </Label>
                                                <Select value={selectedGroupKey} onValueChange={(value) => setSelectedGroupKey(value)}>
                                                    <SelectTrigger id="group-filter" className="w-full">
                                                        <SelectValue placeholder="Semua grup" />
                                                    </SelectTrigger>
                                                    <SelectContent className="min-w-[16rem]">
                                                        <SelectItem value="all">Semua grup</SelectItem>
                                                        {chartSeries.map((series) => (
                                                            <SelectItem key={series.key} value={series.key}>
                                                                {series.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <p className="text-xs text-muted-foreground">
                                                    Sesuaikan tampilan grafik berdasarkan grup pakar tertentu.
                                                </p>
                                            </div>
                                        </div>

                                        {hasFilteredData ? (
                                            <>
                                                <ChartContainer config={activeChartConfig} className="aspect-auto h-[360px] w-full">
                                                    <RechartsLineChart
                                                        data={filteredChartData}
                                                        margin={{ left: 16, right: 24, top: 12, bottom: 12 }}
                                                    >
                                                        <CartesianGrid strokeDasharray="4 4" />
                                                        <XAxis
                                                            dataKey="label"
                                                            tickLine={false}
                                                            axisLine={false}
                                                            tickMargin={8}
                                                        />
                                                        <YAxis
                                                            domain={[0, 100]}
                                                            tickFormatter={(value) => `${value}%`}
                                                            width={48}
                                                            tickLine={false}
                                                            axisLine={false}
                                                        />
                                                        <ChartTooltip
                                                            content={
                                                                selectedGroupKey === "all" ? (
                                                                    <ChartTooltipContent
                                                                        labelFormatter={(label, items) =>
                                                                            items?.[0]?.payload?.tooltipDate || label
                                                                        }
                                                                        formatter={(value, name, item) => {
                                                                            if (value === null || value === undefined) {
                                                                                return null
                                                                            }
                                                                            const numericValue = Number(value)
                                                                            if (Number.isNaN(numericValue)) {
                                                                                return null
                                                                            }
                                                                            const dataKey = item.dataKey?.toString() ?? ""
                                                                            const payload = item.payload as Record<string, any>
                                                                            const meta = payload?.[`${dataKey}__meta`]
                                                                            const groupLabel = meta?.groupName ?? resolveGroupLabel(dataKey, name)
                                                                            return (
                                                                                <div className="flex flex-col gap-1">
                                                                                    <span className="font-medium text-foreground">{groupLabel}</span>
                                                                                    <span className="text-xs text-muted-foreground">Tingkat tertinggi: {Math.round(numericValue)}%</span>
                                                                                    {meta ? (
                                                                                        <span className="text-[10px] text-muted-foreground">
                                                                                            Dep {meta.depression}% · Ans {meta.anxiety}% · Str {meta.stress}%<br />Dominan: {meta.dominantLabel}
                                                                                        </span>
                                                                                    ) : null}
                                                                                </div>
                                                                            )
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <ChartTooltipContent
                                                                        labelFormatter={(label, items) =>
                                                                            items?.[0]?.payload?.tooltipDate || label
                                                                        }
                                                                        formatter={(value, name) => {
                                                                            if (value === null || value === undefined) {
                                                                                return null
                                                                            }
                                                                            const numericValue = Number(value)
                                                                            if (Number.isNaN(numericValue)) {
                                                                                return null
                                                                            }
                                                                            return (
                                                                                <div className="flex flex-col gap-1">
                                                                                    <span className="font-medium text-foreground">{name}</span>
                                                                                    <span className="text-xs text-muted-foreground">Skor: {Math.round(numericValue)}%</span>
                                                                                </div>
                                                                            )
                                                                        }}
                                                                    />
                                                                )
                                                            }
                                                        />
                                                        <Legend
                                                            verticalAlign="bottom"
                                                            height={36}
                                                            formatter={(value: string, entry: any) =>
                                                                selectedGroupKey === "all"
                                                                    ? resolveGroupLabel((entry?.dataKey as string) ?? value, value)
                                                                    : value
                                                            }
                                                        />
                                                        {activeSeries.map((series) => (
                                                            <Line
                                                                key={series.key}
                                                                type="monotone"
                                                                dataKey={series.key}
                                                                stroke={`var(--color-${series.key}, ${series.color})`}
                                                                strokeWidth={2}
                                                                dot={{ r: 3, stroke: `var(--color-${series.key}, ${series.color})`, strokeWidth: 1.5, fill: "#ffffff" }}
                                                                activeDot={{ r: 5, stroke: `var(--color-${series.key}, ${series.color})`, strokeWidth: 2, fill: "#ffffff" }}
                                                                connectNulls
                                                                isAnimationActive={false}
                                                                name={series.label}
                                                            />
                                                        ))}
                                                    </RechartsLineChart>
                                                </ChartContainer>
                                                <p className="text-xs text-muted-foreground">
                                                    {selectedGroupKey === "all"
                                                        ? `Menampilkan semua grup pakar untuk ${timeWindowWeeks === 1 ? "1 minggu" : `${timeWindowWeeks} minggu`} terakhir. Nilai menggambarkan tingkat gejala tertinggi (skala 0-100%).`
                                                        : `Menampilkan skor Depresi, Ansietas, dan Stres untuk ${selectedGroupLabel} dalam ${timeWindowWeeks === 1 ? "1 minggu" : `${timeWindowWeeks} minggu`} terakhir.`
                                                    }
                                                </p>
                                                {advancedInsights && selectedGroupKey === "all" ? (
                                                    <div className="space-y-4 rounded-lg border border-border/60 bg-muted/10 p-4">
                                                        <div className="flex items-center gap-2 text-foreground">
                                                            <BarChart3 className="h-4 w-4 text-primary" />
                                                            <span className="text-sm font-semibold">Analisis Lanjutan</span>
                                                        </div>
                                                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                                            <div>
                                                                <p className="text-[11px] uppercase text-muted-foreground">Total sesi</p>
                                                                <p className="text-sm font-semibold text-foreground">{advancedInsights.sessionCount}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-[11px] uppercase text-muted-foreground">Rata-rata intensitas</p>
                                                                <p className="text-sm font-semibold text-foreground">{Math.round(advancedInsights.averageIntensity)}%</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-[11px] uppercase text-muted-foreground">Tren</p>
                                                                <p className="text-sm font-semibold text-foreground">
                                                                    {advancedInsights.trendLabel}
                                                                    {advancedInsights.trendDelta !== 0 ? ` (${advancedInsights.trendDelta > 0 ? "+" : ""}${advancedInsights.trendDelta}%)` : ""}
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <p className="text-[11px] uppercase text-muted-foreground">Gejala dominan</p>
                                                                <p className="text-sm font-semibold text-foreground">{advancedInsights.dominantLabel}</p>
                                                            </div>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground">
                                                            Sesi terakhir: {new Date(advancedInsights.latestTimestamp).toLocaleString("id-ID", { dateStyle: "long", timeStyle: "short" })} · {advancedInsights.latestGroup} ({Math.round(advancedInsights.latestValue)}%)
                                                        </p>
                                                        {advancedInsights.recommendations.length ? (
                                                            <div className="space-y-2 rounded-md border border-dashed border-border/60 bg-background/60 p-3 text-xs text-muted-foreground">
                                                                {advancedInsights.recommendations.map((item, index) => (
                                                                    <div key={index} className="flex gap-2 text-left">
                                                                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary/70"></span>
                                                                        <span>{item}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                ) : null}
                                            </>
                                        ) : (
                                            <div className="text-center py-12 rounded-lg border border-dashed border-border/50 bg-muted/20">
                                                <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                                                    <TrendingUp className="w-8 h-8 text-muted-foreground" />
                                                </div>
                                                <h3 className="text-lg font-semibold text-foreground mb-1">Data tidak ditemukan</h3>
                                                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                                                    Tidak ada sesi dalam {timeWindowWeeks === 1 ? "1 minggu" : `${timeWindowWeeks} minggu`} terakhir untuk {selectedGroupKey === "all" ? "semua grup" : selectedGroupLabel}. Coba perluas rentang waktu atau pilih opsi "Semua grup".
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteConfirm !== null} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Riwayat Deteksi?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus riwayat deteksi ini? Tindakan ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex gap-3 justify-end">
                        <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteConfirm !== null && handleDeleteHistory(deleteConfirm)}
                            disabled={isDeleting}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            {isDeleting ? "Menghapus..." : "Hapus"}
                        </AlertDialogAction>
                    </div>
                </AlertDialogContent>
            </AlertDialog>

            {/* Modal Pilih Grup */}
            {showGroupModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden animate-in fade-in zoom-in-95">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
                            <div>
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-primary" /> Pilih Grup Pakar
                                </h2>
                                <p className="text-xs text-muted-foreground">
                                    Pilih grup pakar yang akan digunakan untuk interpretasi hasil DASS-21 Anda.
                                </p>
                            </div>
                            <button
                                className="text-muted-foreground hover:text-destructive"
                                onClick={() => setShowGroupModal(false)}
                                aria-label="Tutup"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(80vh-4rem)]">
                            {groups.length === 0 ? (
                                <div className="text-center py-12 rounded-lg border border-dashed border-border/50 bg-muted/20">
                                    <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                    <p className="text-muted-foreground">Belum ada grup pakar tersedia.</p>
                                    <p className="text-xs text-muted-foreground mt-2">Silakan hubungi admin untuk membuat grup.</p>
                                </div>
                            ) : (
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {groups.map((group) => (
                                        <button
                                            key={group.id}
                                            className="text-left border border-border bg-card hover:bg-muted/40 rounded-xl p-4 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                                            onClick={() => handleSelectGroup(group.id)}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-foreground">{group.name}</h3>
                                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                                        {group.description || "Tidak ada deskripsi"}
                                                    </p>
                                                </div>
                                                <Badge variant="secondary" className="bg-primary/10 text-primary">
                                                    {group.member_count ?? 0} Pakar
                                                </Badge>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </main>
    )
}