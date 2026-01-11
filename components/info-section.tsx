"use client"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { AlertCircle, BookOpen, Shield } from "lucide-react"

export function InfoSection() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
      <div className="grid gap-3 sm:gap-4">
        <Card className="border-secondary/50 bg-secondary/5">
          <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
            <div className="flex items-center gap-2 mb-1 sm:mb-2">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-secondary shrink-0" />
              <h4 className="font-semibold text-foreground text-sm sm:text-base">Tentang DASS-21</h4>
            </div>
            <CardDescription className="text-[10px] sm:text-xs">
              Depression Anxiety Stress Scales (DASS-21) adalah alat skrining standar untuk mendeteksi gangguan mood
            </CardDescription>
          </CardHeader>
          <CardContent className="text-[10px] sm:text-xs text-muted-foreground p-3 sm:p-6 pt-0">
            DASS-21 mengukur tiga dimensi: depresi, kecemasan, dan stres dengan 21 pernyataan yang telah divalidasi
            secara ilmiah.
          </CardContent>
        </Card>

        <Card className="border-accent/50 bg-accent/5">
          <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
            <div className="flex items-center gap-2 mb-1 sm:mb-2">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-accent shrink-0" />
              <h4 className="font-semibold text-foreground text-sm sm:text-base">Tentang DASS-42</h4>
            </div>
            <CardDescription className="text-[10px] sm:text-xs">
              Versi komprehensif dengan 42 item untuk pengukuran lebih detail dan akurat
            </CardDescription>
          </CardHeader>
          <CardContent className="text-[10px] sm:text-xs text-muted-foreground p-3 sm:p-6 pt-0">
            DASS-42 menyediakan skalabilitas lebih tinggi dan sensitivitas yang lebih baik untuk penelitian mendalam dan
            pengaturan klinis.
          </CardContent>
        </Card>

        <Card className="border-primary/50 bg-primary/5">
          <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
            <div className="flex items-center gap-2 mb-1 sm:mb-2">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
              <h4 className="font-semibold text-foreground text-sm sm:text-base">Privasi & Keamanan</h4>
            </div>
            <CardDescription className="text-[10px] sm:text-xs">
              Data Anda dilindungi dengan enkripsi tingkat enterprise
            </CardDescription>
          </CardHeader>
          <CardContent className="text-[10px] sm:text-xs text-muted-foreground p-3 sm:p-6 pt-0">
            Semua informasi pribadi dan hasil tes disimpan dengan aman dan tidak dibagikan kepada pihak ketiga tanpa
            persetujuan Anda.
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
