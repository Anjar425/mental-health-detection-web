"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Calendar, TrendingUp, LogOut } from 'lucide-react'
import Link from "next/link"
import { useRouter } from 'next/navigation'
import { jwtDecode } from "jwt-decode"

interface DASS21Record {
	id: string
	date: string
	timestamp: string
	depression: number
	anxiety: number
	stress: number
	dominant: "Depresi" | "Ansietas" | "Stres"
	notes?: string
}

interface DASS42Record {
	id: string
	date: string
	timestamp: string
	depression: { level: string; score: number }
	anxiety: { level: string; score: number }
	stress: { level: string; score: number }
	dominant: "Depresi" | "Ansietas" | "Stres"
	notes?: string
}

type DetectionRecord = DASS21Record | DASS42Record

export default function UserDashboardPage() {
	const router = useRouter()
	const [activeTab, setActiveTab] = useState<"dass21" | "dass42">("dass21")
	const [userEmail, setUserEmail] = useState("")

	const [dass21Records, setDass21Records] = useState<DASS21Record[]>([
		{
			id: "1",
			date: "15 Nov 2025",
			timestamp: "10:30 AM",
			depression: 45,
			anxiety: 30,
			stress: 25,
			dominant: "Depresi",
			notes: "Merasa lebih baik"
		},
		{
			id: "2",
			date: "10 Nov 2025",
			timestamp: "02:15 PM",
			depression: 25,
			anxiety: 50,
			stress: 25,
			dominant: "Ansietas",
			notes: "Cemas berlebihan tentang pekerjaan"
		},
		{
			id: "3",
			date: "05 Nov 2025",
			timestamp: "09:45 AM",
			depression: 30,
			anxiety: 30,
			stress: 40,
			dominant: "Stres",
			notes: ""
		}
	])

	const [dass42Records, setDass42Records] = useState<DASS42Record[]>([
		{
			id: "4",
			date: "12 Nov 2025",
			timestamp: "03:20 PM",
			depression: { level: "Severe", score: 28 },
			anxiety: { level: "Moderate", score: 20 },
			stress: { level: "Mild", score: 14 },
			dominant: "Depresi",
			notes: "Hasil dari sistem kepakaran"
		},
		{
			id: "5",
			date: "08 Nov 2025",
			timestamp: "11:00 AM",
			depression: { level: "Moderate", score: 18 },
			anxiety: { level: "Severe", score: 32 },
			stress: { level: "Moderate", score: 19 },
			dominant: "Ansietas",
			notes: "Perlu konsultasi lebih lanjut"
		}
	])

	useEffect(() => {
		const token = sessionStorage.getItem("authToken")
		if (!token) {
			window.location.href = "/auth/login"
			return
		}

		try {
			const payload: any = jwtDecode(token)

			if (payload.exp * 1000 < Date.now()) {
				sessionStorage.removeItem("authToken")
				window.location.href = "/auth/login"
				return
			}

			if (payload.role === "expert") {
				window.location.href = "/expert/dashboard"
			}

			setUserEmail(payload.sub)

		} catch (err) {
			sessionStorage.removeItem("authToken")
			window.location.href = "/auth/login"
		}
	}, [])

	const handleLogout = () => {
		sessionStorage.removeItem("userSession")
		router.push("/")
	}

	const getSeverityColor = (level: string) => {
		switch (level) {
			case "Normal":
				return "bg-green-100 text-green-800"
			case "Mild":
				return "bg-blue-100 text-blue-800"
			case "Moderate":
				return "bg-yellow-100 text-yellow-800"
			case "Severe":
				return "bg-orange-100 text-orange-800"
			case "Extremely Severe":
				return "bg-red-100 text-red-800"
			default:
				return "bg-gray-100 text-gray-800"
		}
	}

	const getDominantColor = (dominant: string) => {
		switch (dominant) {
			case "Depresi":
				return "border-l-4 border-l-blue-500"
			case "Ansietas":
				return "border-l-4 border-l-purple-500"
			case "Stres":
				return "border-l-4 border-l-amber-500"
			default:
				return ""
		}
	}

	const records = activeTab === "dass21" ? dass21Records : dass42Records

	return (
		<main className="min-h-screen bg-background">
			<Header />

			<div className="max-w-6xl mx-auto px-4 py-8">
				{/* Header Section */}
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
					<div>
						<h1 className="text-3xl font-bold text-foreground mb-2">Dashboard Saya</h1>
						<p className="text-muted-foreground">Selamat datang, {userEmail}</p>
					</div>
					<button
						onClick={handleLogout}
						className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground hover:bg-muted/80 rounded-lg transition-colors font-medium text-sm"
					>
						<LogOut className="w-4 h-4" />
						Logout
					</button>
				</div>

				{/* Tab Navigation */}
				<div className="grid grid-cols-2 gap-3 mb-8">
					<button
						onClick={() => setActiveTab("dass21")}
						className={`p-4 rounded-lg border transition-all font-medium ${activeTab === "dass21"
							? "border-primary bg-primary/5 text-primary"
							: "border-border/40 bg-card text-muted-foreground hover:border-border/60"
							}`}
					>
						<div className="text-sm mb-1">Sistem Pendukung Keputusan</div>
						<div className="text-xs opacity-75">DASS-21</div>
					</button>
					<button
						onClick={() => setActiveTab("dass42")}
						className={`p-4 rounded-lg border transition-all font-medium ${activeTab === "dass42"
							? "border-primary bg-primary/5 text-primary"
							: "border-border/40 bg-card text-muted-foreground hover:border-border/60"
							}`}
					>
						<div className="text-sm mb-1">Sistem Kepakaran</div>
						<div className="text-xs opacity-75">DASS-42</div>
					</button>
				</div>

				{/* Detection History */}
				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<h2 className="text-xl font-bold text-foreground">
							Riwayat Deteksi {activeTab === "dass21" ? "DASS-21" : "DASS-42"}
						</h2>
						<div className="text-sm text-muted-foreground">
							Total: {records.length} deteksi
						</div>
					</div>

					{records.length === 0 ? (
						<div className="text-center py-12 rounded-lg border border-border/40 bg-muted/20">
							<TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
							<p className="text-muted-foreground mb-4">Belum ada riwayat deteksi</p>
							<Link
								href="/"
								className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
							>
								Mulai Deteksi Sekarang
							</Link>
						</div>
					) : (
						<div className="space-y-3">
							{records.map((record) => (
								<div
									key={record.id}
									className={`p-4 rounded-lg border border-border/40 bg-card hover:border-border/60 transition-colors ${getDominantColor(record.dominant)}`}
								>
									<div className="flex flex-col sm:flex-row justify-between items-start gap-4">
										<div className="flex-1">
											<div className="flex items-center gap-2 mb-3">
												<Calendar className="w-4 h-4 text-muted-foreground" />
												<span className="text-sm font-medium text-foreground">{record.date}</span>
												<span className="text-xs text-muted-foreground">{record.timestamp}</span>
											</div>

											{activeTab === "dass21" ? (
												<div className="space-y-2">
													<div className="grid grid-cols-3 gap-3">
														<div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
															<div className="text-xs text-muted-foreground mb-1">Depresi</div>
															<div className="text-xl font-bold text-blue-600 dark:text-blue-400">{(record as DASS21Record).depression}%</div>
														</div>
														<div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
															<div className="text-xs text-muted-foreground mb-1">Ansietas</div>
															<div className="text-xl font-bold text-purple-600 dark:text-purple-400">{(record as DASS21Record).anxiety}%</div>
														</div>
														<div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
															<div className="text-xs text-muted-foreground mb-1">Stres</div>
															<div className="text-xl font-bold text-amber-600 dark:text-amber-400">{(record as DASS21Record).stress}%</div>
														</div>
													</div>
													<div className="bg-muted/50 px-3 py-2 rounded-lg">
														<span className="text-xs text-muted-foreground">Dominan: </span>
														<span className="text-sm font-semibold text-foreground">{record.dominant}</span>
													</div>
												</div>
											) : (
												<div className="space-y-2">
													<div className="grid grid-cols-3 gap-3">
														<div className="border border-border/40 p-3 rounded-lg">
															<div className="text-xs text-muted-foreground mb-1">Depresi</div>
															<div className="text-sm font-semibold text-foreground mb-1">{(record as DASS42Record).depression.score}</div>
															<span className={`text-xs px-2 py-1 rounded-full ${getSeverityColor((record as DASS42Record).depression.level)}`}>
																{(record as DASS42Record).depression.level}
															</span>
														</div>
														<div className="border border-border/40 p-3 rounded-lg">
															<div className="text-xs text-muted-foreground mb-1">Ansietas</div>
															<div className="text-sm font-semibold text-foreground mb-1">{(record as DASS42Record).anxiety.score}</div>
															<span className={`text-xs px-2 py-1 rounded-full ${getSeverityColor((record as DASS42Record).anxiety.level)}`}>
																{(record as DASS42Record).anxiety.level}
															</span>
														</div>
														<div className="border border-border/40 p-3 rounded-lg">
															<div className="text-xs text-muted-foreground mb-1">Stres</div>
															<div className="text-sm font-semibold text-foreground mb-1">{(record as DASS42Record).stress.score}</div>
															<span className={`text-xs px-2 py-1 rounded-full ${getSeverityColor((record as DASS42Record).stress.level)}`}>
																{(record as DASS42Record).stress.level}
															</span>
														</div>
													</div>
													<div className="bg-muted/50 px-3 py-2 rounded-lg">
														<span className="text-xs text-muted-foreground">Paling Dominan: </span>
														<span className="text-sm font-semibold text-foreground">{record.dominant}</span>
													</div>
												</div>
											)}

											{record.notes && (
												<p className="text-sm text-muted-foreground mt-3">Catatan: {record.notes}</p>
											)}
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</div>

				{/* Quick Actions */}
				<div className="mt-12 p-6 rounded-lg border border-border/40 bg-muted/20">
					<h3 className="text-lg font-bold text-foreground mb-4">Tindakan Cepat</h3>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<Link
							href="/"
							className="p-4 rounded-lg border border-border/40 bg-card hover:border-primary hover:bg-primary/5 transition-all text-center font-medium text-foreground"
						>
							Mulai Deteksi Baru
						</Link>
						<button
							className="p-4 rounded-lg border border-border/40 bg-card hover:border-primary hover:bg-primary/5 transition-all text-center font-medium text-foreground"
						>
							Lihat Laporan Detail
						</button>
					</div>
				</div>
			</div>
		</main>
	)
}
