"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LogOut } from "lucide-react"
import { RulesetModule } from "@/components/expert/ruleset-module"
import { PreferenceModule } from "@/components/expert/preference-module"
import { ProfileInfluenceModule } from "@/components/expert/profile-influence-module"
import { jwtDecode } from "jwt-decode"
import { RankingModule } from "@/components/expert/ranking-module"


export default function ExpertDashboard() {
	const [isLoggedIn, setIsLoggedIn] = useState(false)
	const [expertEmail, setExpertEmail] = useState("")
	const [loading, setLoading] = useState(true);


	useEffect(() => {
		const token = sessionStorage.getItem("authToken");

		if (!token) {
			console.log(token)
			// window.location.href = "/auth/login";
		} else {
			try {
				const decodedToken: any = jwtDecode(token);

				const userRole = decodedToken.role;
				const userEmail = decodedToken.sub
				if (userRole !== "expert") {
					console.log(userRole)
					// window.location.href = "/auth/login";
				} else {
					setIsLoggedIn(true);
					setExpertEmail(userEmail || "");
				}
			} catch (err) {
				console.error("Error decoding token:", err);
				// window.location.href = "/auth/login";
			}
		}

		setLoading(false);
	}, []);

	const handleLogout = () => {
		sessionStorage.removeItem("authToken")
		window.location.href = "/"
	}

	if (loading) {
		return <div>Loading...</div>;
	}

	return (
		<main className="min-h-screen bg-background">
			{/* Header */}
			<header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur-sm">
				<div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-bold text-foreground">Dashboard Pakar</h1>
						<p className="text-sm text-muted-foreground">{expertEmail}</p>
					</div>
					<Button variant="outline" size="sm" onClick={handleLogout} className="gap-2 bg-transparent">
						<LogOut className="w-4 h-4" />
						Logout
					</Button>
				</div>
			</header>

			{/* Main Content */}
			<div className="max-w-7xl mx-auto px-4 py-8">
				<div className="mb-8">
					<h2 className="text-xl font-semibold text-foreground mb-2">Kelola Sistem Pakar</h2>
					<p className="text-muted-foreground">
						Lakukan konfigurasi untuk sistem deteksi kesehatan mental berbasis DASS-21 dan DASS-42
					</p>
				</div>

				{/* Update: Tabs defaultValue bisa diubah ke 'ranking' jika ingin melihat fitur baru langsung */}
				<Tabs defaultValue="ranking" className="w-full">
					{/* Update: Grid cols menjadi 4 untuk mengakomodasi tab baru */}
					<TabsList className="grid w-full grid-cols-4 mb-6">
						<TabsTrigger value="preference">Preferensi DASS-21</TabsTrigger>
						<TabsTrigger value="profile">Profil & Pengaruh</TabsTrigger>
						<TabsTrigger value="ruleset">Ruleset DASS-42</TabsTrigger>
						<TabsTrigger value="ranking">Ranking Pakar</TabsTrigger>
					</TabsList>

					{/* Tab 1: Ruleset Module */}
					<TabsContent value="ruleset" className="space-y-4">
						<RulesetModule />
					</TabsContent>

					{/* Tab 2: Preference Module */}
					<TabsContent value="preference" className="space-y-4">
						<PreferenceModule />
					</TabsContent>

					{/* Tab 3: Profile & Influence Module */}
					<TabsContent value="profile" className="space-y-4">
						<ProfileInfluenceModule />
					</TabsContent>

					{/* Tab 4: Ranking Module (New) */}
					<TabsContent value="ranking" className="space-y-4">
						<RankingModule />
					</TabsContent>
				</Tabs>
			</div>
		</main>
	)
}