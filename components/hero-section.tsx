"use client"

import { Button } from "@/components/ui/button"
import { Heart, Brain, TrendingUp } from "lucide-react"

interface HeroSectionProps {
	onGetStarted?: () => void
	onLearnMore?: () => void
}

export function HeroSection({ onGetStarted, onLearnMore }: HeroSectionProps) {
	return (
		<div className="relative overflow-hidden">
			<div className="gradient-mesh absolute inset-0 pointer-events-none" />

			<div className="relative max-w-2xl mx-auto px-4 py-8 sm:py-12">
				<div className="text-center mb-8 sm:mb-12">
					<div className="inline-flex items-center justify-center gap-2 mb-3 sm:mb-4">
						<div className="p-2 sm:p-3 rounded-full bg-primary/10">
							<Brain className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
						</div>
					</div>

					<h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4 leading-tight">
						Jaga Kesehatan Mental Anda
					</h2>

					<p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 leading-relaxed max-w-sm mx-auto px-4">
						Deteksi dini kondisi kesehatan mental dengan sistem pakar yang telah terbukti efektif berbasis DASS-21
					</p>

					<div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 mb-8 sm:mb-10 px-4">
						<div className="flex items-center gap-2 justify-center text-xs sm:text-sm text-muted-foreground">
							<Heart className="w-3 h-3 sm:w-4 sm:h-4 text-accent shrink-0" />
							<span>Aman & Privat</span>
						</div>
						<div className="flex items-center gap-2 justify-center text-xs sm:text-sm text-muted-foreground">
							<Brain className="w-3 h-3 sm:w-4 sm:h-4 text-accent shrink-0" />
							<span>Berbasis Ilmiah</span>
						</div>
						<div className="flex items-center gap-2 justify-center text-xs sm:text-sm text-muted-foreground">
							<TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-accent shrink-0" />
							<span>Hasil Instan</span>
						</div>
					</div>

					<div className="flex flex-col gap-3 sm:flex-row sm:justify-center px-4">
						<Button
							size="lg"
							className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold w-full sm:w-auto"
							onClick={onGetStarted}
						>
							Mulai Deteksi
						</Button>

						<Button
							size="lg"
							variant="outline"
							className="rounded-full border-primary/30 text-primary hover:bg-primary/5 bg-transparent w-full sm:w-auto"
							onClick={onLearnMore}
						>
							Pelajari Lebih Lanjut
						</Button>
					</div>
				</div>
			</div>
		</div>
	)
}
