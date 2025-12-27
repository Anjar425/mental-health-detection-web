"use client"

import { useState, useEffect } from "react"
import { LogOut, Calendar, TrendingUp, Activity, ClipboardList, ArrowRight, AlertCircle, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { jwtDecode } from "jwt-decode"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
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
                const groupsResponse = await axios.get(`${process.env.NEXT_PUBLIC_API}/admin/groups`, {
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
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API}/admin/groups`, {
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

            <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
                
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