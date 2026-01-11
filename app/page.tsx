"use client"

import { useRef, useState } from "react"
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { FeatureCards } from "@/components/feature-cards"
import { RoleSelector } from "@/components/role-selector"
import { InfoSection } from "@/components/info-section"
import { SystemSelectionModal } from "@/components/system-selection-modal"

export default function HomePage() {
	const [showRoleSelector, setShowRoleSelector] = useState(false)
	const [showSystemModal, setShowSystemModal] = useState(false)
	const infoRef = useRef<HTMLDivElement>(null)


	const handleGetStarted = () => {
		setShowSystemModal(true)
	}

	const handleSelectSystem = (system: "dass21" | "dass42") => {
		if (system === "dass21") {
			window.location.href = "/detection/dass21"
		} else {
			window.location.href = "/detection/dass42"
		}
	}

	const handleRoleSelect = (role: string) => {
		switch (role) {
			case "guest":
				window.location.href = "/test"
				break
			case "user":
				window.location.href = "/auth/login"
				break
		}
	}

	const handleLearnMore = () => {
		infoRef.current?.scrollIntoView({ behavior: "smooth" })
	}


	return (
		<main className="min-h-screen bg-background">
			<Header />

			<div className="space-y-0">
				{/* Hero Section */}
				<HeroSection onGetStarted={handleGetStarted} onLearnMore={handleLearnMore} />

				{/* Feature Cards */}
				<section ref={infoRef}>
					<FeatureCards />
				</section>
				{/* Role Selector */}
				{/* <section id="role-selector" className="bg-muted/30 border-t border-border/40">
          <RoleSelector onRoleSelect={handleRoleSelect} />
        </section> */}

				{/* Info Section */}
				<section className="border-t border-border/40">
					<InfoSection />
				</section>

				{/* Footer */}
				<footer className="border-t border-border/40 py-6 sm:py-8 px-4 mt-8 sm:mt-12">
					<div className="max-w-2xl mx-auto">
						<div className="text-center text-xs sm:text-sm text-muted-foreground">
							<p className="mb-2">MindCare - Platform Deteksi Kesehatan Mental</p>
							<p className="text-[10px] sm:text-xs">© 2025 MindCare. Sistem pakar berbasis DASS-21 dan DASS-42.</p>
						</div>
						<div className="flex justify-center gap-4 sm:gap-6 mt-3 sm:mt-4 text-[10px] sm:text-xs text-muted-foreground">
							<a href="#" className="hover:text-primary transition-colors">
								Privacy
							</a>
							<a href="#" className="hover:text-primary transition-colors">
								Terms
							</a>
							<a href="#" className="hover:text-primary transition-colors">
								Contact
							</a>
						</div>
					</div>
				</footer>
			</div>

			{/* System Selection Modal */}
			<SystemSelectionModal
				open={showSystemModal}
				onClose={() => setShowSystemModal(false)}
				onSelectSystem={handleSelectSystem}
			/>
		</main>
	)
}
