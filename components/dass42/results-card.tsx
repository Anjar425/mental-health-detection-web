"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

type Variant = "secondary" | "default" | "destructive"

type LevelInfo = {
	level: string
	color: string
	variant: Variant
}

// mapping level -> display info (color kept for optional styling)
const levelMap: Record<string, LevelInfo> = {
	Normal: { level: "Normal", color: "bg-success", variant: "secondary" },
	Mild: { level: "Mild", color: "bg-warning", variant: "secondary" },
	Moderate: { level: "Moderate", color: "bg-warning", variant: "default" },
	Severe: { level: "Severe", color: "bg-destructive", variant: "destructive" },
	"Extremely Severe": { level: "Extremely Severe", color: "bg-destructive", variant: "destructive" },
}

// safe pick top membership
function pickTopMembership(memberships?: Record<string, number>) {
	let bestName = "Normal"
	let bestValue = 0

	if (!memberships || Object.keys(memberships).length === 0) {
		return { name: bestName, degree: bestValue }
	}

	for (const [name, val] of Object.entries(memberships)) {
		const num = Number(val ?? 0)
		// if equal, keep earlier one (first encountered)
		if (Number.isFinite(num) && num > bestValue) {
			bestValue = num
			bestName = name
		}
	}

	return { name: bestName, degree: bestValue }
}

/**
 * shape of a single inference domain in backend response
 */
interface InferenceDomain {
	score: number
	membership_degrees: Record<string, number>
}

/**
 * full inference response shape
 */
interface InferenceResponse {
	depression?: InferenceDomain
	anxiety?: InferenceDomain
	stress?: InferenceDomain
	[key: string]: any
}

interface ResultsCardProps {
	inference: InferenceResponse
	onRestart: () => void
}

const severityRank: Record<string, number> = {
	"Normal": 0,
	"Mild": 1,
	"Moderate": 2,
	"Severe": 3,
	"Extremely Severe": 4,
};

export function ResultsCard({ inference, onRestart }: ResultsCardProps) {
	// safe defaults if backend not provided
	const safeInference: InferenceResponse = inference ?? {}

	const domains = ["depression", "anxiety", "stress"] as const

	// build results with severity + degree
	const results = domains.map((domain) => {
		const entry: InferenceDomain = (safeInference as any)[domain] ?? { score: 0, membership_degrees: {} }
		const score = Number(entry.score ?? 0)

		const top = pickTopMembership(entry.membership_degrees)
		const info = levelMap[top.name] ?? { level: top.name, color: "bg-warning", variant: "secondary" as Variant }
		const severityInfo = levelMap[top.name];

		return {
			key: domain,
			domain,
			title: domain === "depression" ? "Depresi" : domain === "anxiety" ? "Kecemasan" : "Stres",
			score,
			severity: { ...info, degree: top.degree },
			severityRank: severityRank[severityInfo.level]
		}
	})

	const maxScore = 42

	// find dominant by highest membership degree (not by score)
	const dominant = results.reduce((a, b) =>
		a.severityRank > b.severityRank ? a : b
	);
	// helper to keep progress safe 0..100
	const progressValue = (v: number) => {
		const p = (v / maxScore) * 100
		if (!Number.isFinite(p)) return 0
		return Math.max(0, Math.min(100, p))
	}

	return (
		<div className="min-h-screen bg-linear-to-br from-background via-accent/5 to-background p-4">
			<div className="max-w-4xl mx-auto pt-8">
				{/* Header */}
				<div className="text-center mb-8">
					<h1 className="text-4xl font-bold mb-4">Hasil Sistem Pakar DASS-42</h1>
					<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
						Berikut adalah hasil evaluasi kesehatan mental Anda berdasarkan jawaban yang diberikan.
					</p>
				</div>

				{/* Dominant symptom card */}
				<Card className="border-2 border-accent/20 mb-6">
					<CardHeader>
						<CardTitle className="text-xl">Gejala yang Paling Dominan</CardTitle>
						<CardDescription>Berdasarkan gejala tertinggi pada hasil sistem pakar</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="flex items-center justify-between gap-4">
							<div>
								<p className="text-lg font-semibold">{dominant.title}</p>
								<p className="text-muted-foreground mt-1">
									Tingkat: <span className="font-medium">{dominant.severity.level}</span>
								</p>
							</div>

							{/* Badge with variant + optional color indicator */}
							<div className="flex items-center gap-3">
								{/* small color bar (uses severity.color as class) */}
								<div className={`w-10 h-10 rounded-full flex items-center justify-center ${dominant.severity.color} mr-2`} />
								<Badge variant={dominant.severity.variant} className="text-base px-4 py-1">
									{dominant.severity.level}
								</Badge>
							</div>
						</div>

						<Progress value={progressValue(dominant.score)} className="h-3 mt-4" />
					</CardContent>
				</Card>

				{/* Results Cards */}
				<div className="grid gap-6 md:grid-cols-3 mb-8">
					{results.map((r) => (
						<Card key={r.key} className="border-2 border-accent/20">
							<CardHeader className="pb-4">
								<div className="flex items-center justify-between">
									<CardTitle className="text-lg">{r.title}</CardTitle>
									<Badge variant={r.severity.variant}>{r.severity.level}</Badge>
								</div>
								<CardDescription>
									Skor: <span className="font-mono">{r.score.toFixed(1)}</span> / {maxScore}
								</CardDescription>
							</CardHeader>
							<CardContent>
								<Progress value={progressValue(r.score)} className="h-3 mb-2" />
								<p className="text-sm text-muted-foreground">
									{r.severity.level === "Normal"
										? `Tingkat ${r.title.toLowerCase()} dalam rentang normal`
										: `Menunjukkan gejala ${r.title.toLowerCase()} tingkat ${r.severity.level.toLowerCase()}`}
								</p>

							</CardContent>
						</Card>
					))}
				</div>

				{/* Recommendations */}
				<Card className="border-2 border-accent/20 mb-8">
					<CardHeader>
						<CardTitle className="text-xl">Rekomendasi</CardTitle>
						<CardDescription>
							Berdasarkan hasil evaluasi, berikut adalah beberapa saran untuk Anda
						</CardDescription>
					</CardHeader>

					<CardContent className="space-y-4">
						{results.some((r) => r.severity.level !== "Normal") ? (
							<>
								<div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
									<h4 className="font-semibold text-warning-foreground mb-2">⚠️ Perhatian</h4>
									<p className="text-sm">
										Hasil menunjukkan adanya gejala yang perlu diperhatikan. Disarankan untuk konsultasi
										dengan profesional.
									</p>
								</div>

								<ul className="text-sm text-muted-foreground space-y-1 ml-4">
									<li>• Konsultasi dengan psikolog atau psikiater</li>
									<li>• Praktik teknik relaksasi dan mindfulness</li>
									<li>• Menjaga pola tidur dan olahraga teratur</li>
									<li>• Bangun sistem dukungan sosial</li>
								</ul>
							</>
						) : (
							<div className="p-4 bg-success/10 border border-success/20 rounded-lg">
								<h4 className="font-semibold text-success-foreground mb-2">✅ Hasil Baik</h4>
								<p className="text-sm">Tingkat kesehatan mental Anda dalam kondisi baik. Pertahankan pola hidup sehat.</p>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Actions */}
				<div className="flex justify-center gap-4">
					<Button onClick={onRestart} variant="outline" className="px-8 bg-transparent">
						Kembali ke Home
					</Button>
					<Button onClick={() => window.print()} className="px-8">
						Cetak Hasil
					</Button>
				</div>

				{/* Disclaimer */}
				<Card className="mt-8 border-muted">
					<CardContent className="pt-6">
						<p className="text-xs text-muted-foreground text-center">
							<strong>Disclaimer:</strong> Hasil kuisioner ini hanya untuk tujuan skrining awal dan tidak dapat
							menggantikan diagnosis profesional. Jika Anda mengalami gejala yang mengganggu aktivitas sehari-hari,
							segera konsultasikan dengan tenaga kesehatan mental yang qualified.
						</p>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
