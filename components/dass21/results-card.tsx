"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart"
import { Pie, PieChart } from "recharts"

interface Scores {
	depression: number
	anxiety: number
	stress: number
}

interface ResultsCardProps {
	scores: Scores
	onRestart: () => void
}


export function ResultsCard({ scores, onRestart }: ResultsCardProps) {
const chartData = [
  { browser: "Depresi", visitors: Number((scores.depression * 100).toFixed(2)), fill: "var(--chart-1)" },
  { browser: "Kecemasan", visitors: Number((scores.anxiety * 100).toFixed(2)), fill: "var(--chart-2)" },
  { browser: "Stress", visitors: Number((scores.stress * 100).toFixed(2)), fill: "var(--chart-3)" },
];

	const chartConfig = {
		visitors: {
			label: "Visitors",
		},
		Depresi: {
			label: "Depresi",
			color: "var(--chart-1)",
		},
		Kecemasan: {
			label: "Kecemasan",
			color: "var(--chart-2)",
		},
		Stress: {
			label: "Stress",
			color: "var(--chart-3)",
		},
	} satisfies ChartConfig

	return (
		<div className="min-h-screen bg-linear-to-br from-background via-accent/5 to-background p-4">
			<div className="max-w-4xl mx-auto pt-8">
				{/* Header */}
				<div className="text-center mb-8">
					<h1 className="text-4xl font-bold text-foreground mb-4 text-balance">Hasil Sistem Pendukung Keputusan DASS-21</h1>
					<p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
						Berikut adalah hasil evaluasi kesehatan mental Anda berdasarkan jawaban yang diberikan
					</p>
				</div>

				<Card className="border-2 border-accent/20 mb-8">
					<CardHeader>
						<CardTitle className="text-xl">Perolehan Skor</CardTitle>
						<CardDescription>Rincian perhitungan skor berdasarkan kategori pertanyaan</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="flex flex-row">
							<ChartContainer
								config={chartConfig}
								className="[&_.recharts-pie-label-text]:fill-foreground basis-1/2 mx-auto aspect-square max-h-[250px] pb-0"
							>
								<PieChart>
									<ChartTooltip content={<ChartTooltipContent hideLabel />} />
									<Pie data={chartData} dataKey="visitors" label nameKey="browser" />
								</PieChart>
							</ChartContainer>

							<div className="flex flex-col gap-6 justify-center basis-1/2">
								<div className="text-left rounded-lg">
									<div className="text-2xl font-bold font-mono text-chart-1">Depresi: {(scores.depression * 100).toFixed(2)}%</div>
								</div>
								<div className="text-left rounded-lg">
									<div className="text-2xl font-bold font-mono text-chart-2">Kecemasan: {(scores.anxiety * 100).toFixed(2)}%</div>
								</div>
								<div className="text-left rounded-lg">
									<div className="text-2xl font-bold font-mono text-chart-3">Stress: {(scores.stress * 100).toFixed(2)}%</div>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Recommendations */}
				{/* <Card className="border-2 border-accent/20 mb-8">
					<CardHeader>
						<CardTitle className="text-xl">Rekomendasi</CardTitle>
						<CardDescription>Berdasarkan hasil evaluasi, berikut adalah beberapa saran untuk Anda</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						{depressionSeverity.level !== "Normal" ||
							anxietySeverity.level !== "Normal" ||
							stressSeverity.level !== "Normal" ? (
							<>
								<div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
									<h4 className="font-semibold text-warning-foreground mb-2">⚠️ Perhatian</h4>
									<p className="text-sm text-warning-foreground/80">
										Hasil menunjukkan adanya gejala yang perlu diperhatikan. Disarankan untuk berkonsultasi dengan
										profesional kesehatan mental.
									</p>
								</div>
								<div className="space-y-2">
									<h4 className="font-semibold">Langkah yang dapat dilakukan:</h4>
									<ul className="text-sm text-muted-foreground space-y-1 ml-4">
										<li>• Konsultasi dengan psikolog atau psikiater</li>
										<li>• Praktik teknik relaksasi dan mindfulness</li>
										<li>• Menjaga pola tidur dan olahraga teratur</li>
										<li>• Membangun sistem dukungan sosial yang kuat</li>
										<li>• Menghindari alkohol dan substansi berbahaya</li>
									</ul>
								</div>
							</>
						) : (
							<div className="p-4 bg-success/10 border border-success/20 rounded-lg">
								<h4 className="font-semibold text-success-foreground mb-2">✅ Hasil Baik</h4>
								<p className="text-sm text-success-foreground/80">
									Hasil menunjukkan tingkat kesehatan mental yang baik. Tetap jaga kesehatan mental dengan pola hidup
									sehat dan aktivitas positif.
								</p>
							</div>
						)}
					</CardContent>
				</Card> */}

				{/* Actions */}
				<div className="flex justify-center gap-4">
					<Button onClick={onRestart} variant="outline" className="px-8 bg-transparent">
						Isi Ulang Kuisioner
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
