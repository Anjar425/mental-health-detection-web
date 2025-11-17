"use client"
import { Button } from "@/components/ui/button"
import { Heart, Brain, TrendingUp } from "lucide-react"

interface HeroSectionProps {
  onGetStarted?: () => void
}

export function HeroSection({ onGetStarted }: HeroSectionProps) {
  return (
    <div className="relative overflow-hidden">
      {/* Background gradient mesh */}
      <div className="gradient-mesh absolute inset-0 pointer-events-none" />

      <div className="relative max-w-2xl mx-auto px-4 py-12">
        {/* Hero content */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center gap-2 mb-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Brain className="w-6 h-6 text-primary" />
            </div>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
            Jaga Kesehatan Mental Anda
          </h2>

          <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-sm mx-auto">
            Deteksi dini kondisi kesehatan mental dengan sistem pakar yang telah terbukti efektif berbasis DASS-21
          </p>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 gap-3 mb-10 sm:grid-cols-3">
            <div className="flex items-center gap-2 justify-center text-sm text-muted-foreground">
              <Heart className="w-4 h-4 text-accent" />
              <span>Aman & Privat</span>
            </div>
            <div className="flex items-center gap-2 justify-center text-sm text-muted-foreground">
              <Brain className="w-4 h-4 text-accent" />
              <span>Berbasis Ilmiah</span>
            </div>
            <div className="flex items-center gap-2 justify-center text-sm text-muted-foreground">
              <TrendingUp className="w-4 h-4 text-accent" />
              <span>Hasil Instan</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              size="lg"
              className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              onClick={onGetStarted}
            >
              Mulai Deteksi
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full border-primary/30 text-primary hover:bg-primary/5 bg-transparent"
              asChild
            >
              <a href="/auth/login">Pelajari Lebih Lanjut</a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
