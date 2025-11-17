"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface Scores {
  depressionScore: number
  anxietyScore: number
  stressScore: number
}

interface ResultsCardProps {
  scores: Scores
  onRestart: () => void
}

const getSeverityLevel = (score: number, type: "depression" | "anxiety" | "stress") => {
  if (type === "depression") {
    if (score <= 9) return { level: "Normal", color: "bg-success", variant: "secondary" as const }
    if (score <= 13) return { level: "Ringan", color: "bg-warning", variant: "secondary" as const }
    if (score <= 20) return { level: "Sedang", color: "bg-warning", variant: "default" as const }
    if (score <= 27) return { level: "Berat", color: "bg-destructive", variant: "destructive" as const }
    return { level: "Sangat Berat", color: "bg-destructive", variant: "destructive" as const }
  }

  if (type === "anxiety") {
    if (score <= 7) return { level: "Normal", color: "bg-success", variant: "secondary" as const }
    if (score <= 9) return { level: "Ringan", color: "bg-warning", variant: "secondary" as const }
    if (score <= 14) return { level: "Sedang", color: "bg-warning", variant: "default" as const }
    if (score <= 19) return { level: "Berat", color: "bg-destructive", variant: "destructive" as const }
    return { level: "Sangat Berat", color: "bg-destructive", variant: "destructive" as const }
  }

  // stress
  if (score <= 14) return { level: "Normal", color: "bg-success", variant: "secondary" as const }
  if (score <= 18) return { level: "Ringan", color: "bg-warning", variant: "secondary" as const }
  if (score <= 25) return { level: "Sedang", color: "bg-warning", variant: "default" as const }
  if (score <= 33) return { level: "Berat", color: "bg-destructive", variant: "destructive" as const }
  return { level: "Sangat Berat", color: "bg-destructive", variant: "destructive" as const }
}

export function ResultsCard({ scores, onRestart }: ResultsCardProps) {
  const depressionSeverity = getSeverityLevel(scores.depressionScore, "depression")
  const anxietySeverity = getSeverityLevel(scores.anxietyScore, "anxiety")
  const stressSeverity = getSeverityLevel(scores.stressScore, "stress")

  const maxScore = 84 // Maximum possible score for each category with float values

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-accent/5 to-background p-4">
      <div className="max-w-4xl mx-auto pt-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4 text-balance">Hasil Kuisioner DASS-42</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Berikut adalah hasil evaluasi kesehatan mental Anda berdasarkan jawaban yang diberikan
          </p>
        </div>

        {/* Results Cards */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          {/* Depression */}
          <Card className="border-2 border-accent/20">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Depresi</CardTitle>
                <Badge variant={depressionSeverity.variant}>{depressionSeverity.level}</Badge>
              </div>
              <CardDescription>
                Skor: <span className="font-mono">{scores.depressionScore.toFixed(1)}</span> / {maxScore}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={(scores.depressionScore / maxScore) * 100} className="h-3 mb-2" />
              <p className="text-sm text-muted-foreground">
                {depressionSeverity.level === "Normal"
                  ? "Tingkat depresi dalam rentang normal"
                  : `Menunjukkan gejala depresi tingkat ${depressionSeverity.level.toLowerCase()}`}
              </p>
            </CardContent>
          </Card>

          {/* Anxiety */}
          <Card className="border-2 border-accent/20">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Kecemasan</CardTitle>
                <Badge variant={anxietySeverity.variant}>{anxietySeverity.level}</Badge>
              </div>
              <CardDescription>
                Skor: <span className="font-mono">{scores.anxietyScore.toFixed(1)}</span> / {maxScore}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={(scores.anxietyScore / maxScore) * 100} className="h-3 mb-2" />
              <p className="text-sm text-muted-foreground">
                {anxietySeverity.level === "Normal"
                  ? "Tingkat kecemasan dalam rentang normal"
                  : `Menunjukkan gejala kecemasan tingkat ${anxietySeverity.level.toLowerCase()}`}
              </p>
            </CardContent>
          </Card>

          {/* Stress */}
          <Card className="border-2 border-accent/20">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Stres</CardTitle>
                <Badge variant={stressSeverity.variant}>{stressSeverity.level}</Badge>
              </div>
              <CardDescription>
                Skor: <span className="font-mono">{scores.stressScore.toFixed(1)}</span> / {maxScore}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={(scores.stressScore / maxScore) * 100} className="h-3 mb-2" />
              <p className="text-sm text-muted-foreground">
                {stressSeverity.level === "Normal"
                  ? "Tingkat stres dalam rentang normal"
                  : `Menunjukkan gejala stres tingkat ${stressSeverity.level.toLowerCase()}`}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-2 border-accent/20 mb-8">
          <CardHeader>
            <CardTitle className="text-xl">Detail Skor</CardTitle>
            <CardDescription>Rincian perhitungan skor berdasarkan kategori pertanyaan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold font-mono text-red-600">{scores.depressionScore.toFixed(1)}</div>
                <div className="text-sm text-muted-foreground">Depresi (14 item)</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Rata-rata: {(scores.depressionScore / 28).toFixed(2)}
                </div>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold font-mono text-blue-600">{scores.anxietyScore.toFixed(1)}</div>
                <div className="text-sm text-muted-foreground">Kecemasan (14 item)</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Rata-rata: {(scores.anxietyScore / 28).toFixed(2)}
                </div>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold font-mono text-orange-600">{scores.stressScore.toFixed(1)}</div>
                <div className="text-sm text-muted-foreground">Stres (14 item)</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Rata-rata: {(scores.stressScore / 26).toFixed(2)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card className="border-2 border-accent/20 mb-8">
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
        </Card>

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
