"use client"

import type React from "react"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Zap, Users, ClipboardList, Settings } from "lucide-react"

interface FeatureCard {
	icon: React.ReactNode
	title: string
	description: string
	badge?: string
	action?: string
}

const features: FeatureCard[] = [
	{
		icon: <ClipboardList className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />,
		title: "Deteksi Kesehatan Mental",
		description:
			"Jawab kuesioner DASS-21 untuk mendapatkan hasil deteksi kesehatan mental Anda secara mendalam dan akurat",
		badge: "User Biasa",
		action: "Mulai Tes",
	},
	{
		icon: <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />,
		title: "Preferensi Pakar (DASS-21)",
		description: "Input preferensi dan konfigurasi sistem pendukung keputusan berdasarkan framework DASS-21",
		badge: "Pakar",
		action: "Konfigurasi",
	},
	{
		icon: <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-secondary" />,
		title: "Ruleset Sistem (DASS-42)",
		description: "Kelola dan optimalkan ruleset expert system menggunakan metodologi DASS-42 yang komprehensif",
		badge: "Pakar",
		action: "Kelola Ruleset",
	},
	{
		icon: <Users className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />,
		title: "Riwayat & Analisis",
		description: "Lihat riwayat tes Anda dan analisis tren kesehatan mental dari waktu ke waktu",
		badge: "User Terdaftar",
		action: "Lihat Riwayat",
	},
]

export function FeatureCards() {
	return (
		<div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
			<div className="mb-8 sm:mb-12">
				<h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3 sm:mb-4 text-center">Fitur Utama</h3>
				<p className="text-center text-sm sm:text-base text-muted-foreground mb-6 sm:mb-10">Pilih sesuai dengan kebutuhan dan peran Anda</p>
			</div>

			<div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
				{features.map((feature, index) => (
					<Card key={index} className="group hover:shadow-lg transition-all duration-300 border-border/50">
						<CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
							<div className="flex items-start justify-between mb-2 sm:mb-3 gap-2">
								<div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 group-hover:bg-primary/15 transition-colors shrink-0">
									{feature.icon}
								</div>
								{feature.badge && (
									<span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 sm:py-1 rounded-full bg-secondary/20 text-secondary-foreground whitespace-nowrap">
										{feature.badge}
									</span>
								)}
							</div>
							<h4 className="font-semibold text-foreground text-xs sm:text-sm">{feature.title}</h4>
							<CardDescription className="text-[10px] sm:text-xs text-muted-foreground line-clamp-3">{feature.description}</CardDescription>
						</CardHeader>
						<CardContent className="p-3 sm:p-6 pt-0">
							<Button
								variant="ghost"
								size="sm"
								className="w-full justify-center text-primary hover:bg-primary/10 h-7 sm:h-8 text-[10px] sm:text-xs font-medium"
							>
								{feature.action}
							</Button>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	)
}
