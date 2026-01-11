"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import axios from "axios";

interface ExpertProfile {
	education: string
	patientCount: string
	publications: string
	experienceHours: string
}

interface InfluenceWeights {
	education: number
	patientCount: number
	publications: number
	experienceHours: number
}

export function ProfileInfluenceModule() {
	const [isLoading, setIsLoading] = useState<Boolean>(true)
	const [token, setToken] = useState<String | null>(null)

	const [profile, setProfile] = useState<ExpertProfile>({
		education: "",
		patientCount: "",
		publications: "",
		experienceHours: "",
	})

	const [weights, setWeights] = useState<InfluenceWeights>({
		education: 25,
		patientCount: 25,
		publications: 25,
		experienceHours: 25,
	})


	useEffect(() => {
		const expertToken = sessionStorage.getItem("authToken");
		setToken(expertToken);

		const fetchProfile = async () => {
			try {
				const res = await axios.get(
					`${process.env.NEXT_PUBLIC_API}/expert/profile`,
					{
						headers: {
							Authorization: `Bearer ${expertToken}`, // pakai expertToken langsung
						},
					}
				);

				const data = res.data;

				setIsLoading(false);

				setProfile({
					education: data.profile.education_level,
					patientCount: data.profile.patient_count,
					publications: data.profile.publication_count,
					experienceHours: data.profile.flight_hours,
				});

				setWeights({
					education: data.weight.education_weight || 25,
					patientCount: data.weight.patient_weight || 25,
					publications: data.weight.publication_weight || 25,
					experienceHours: data.weight.flight_hours_weight || 25,
				});

			} catch (error) {
				// sessionStorage.clear();
				// window.location.href = "/auth/login";
				setProfile({
					education: "",
					patientCount: "",
					publications: "",
					experienceHours: "",
				});
				setWeights({
					education: 25,
					patientCount: 25,
					publications: 25,
					experienceHours: 25,
				});
				setIsLoading(false);

			}
		};

		fetchProfile();
	}, []);


	const [isSaved, setIsSaved] = useState(false)

	const handleProfileChange = (field: keyof ExpertProfile, value: string) => {
		setProfile({ ...profile, [field]: value })
		setIsSaved(false)
	}

	const handleWeightChange = (field: keyof InfluenceWeights, value: number) => {
		const newWeights = { ...weights, [field]: value }
		const otherFields = Object.keys(newWeights).filter((k) => k !== field) as Array<keyof InfluenceWeights>
		const totalOtherWeight = otherFields.reduce((sum, f) => sum + newWeights[f], 0)

		if (totalOtherWeight + value <= 100) {
			setWeights(newWeights)
			setIsSaved(false)
		}
	}

	const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0)

	const handleSaveProfile = async () => {
		if (token) {
			try {
				const payload = {
					profile: {
						education_level: profile.education,
						publication_count: profile.publications,
						patient_count: profile.patientCount,
						flight_hours: profile.experienceHours
					},
					weight: {
						education_weight: weights.education,
						publication_weight: weights.publications,
						patient_weight: weights.patientCount,
						flight_hours_weight: weights.experienceHours
					}
				};

				await axios.post(
					`${process.env.NEXT_PUBLIC_API}/expert/profile`,
					payload,
					{
						headers: { Authorization: `Bearer ${token}` }
					});

				setIsSaved(true);
				setTimeout(() => setIsSaved(false), 2000);
			} catch (error) {
				console.error("Failed to save:", error);
			}
		}
	};


	if (isLoading) {
		return <div>Loading...</div>;
	}

	return (
		<div className="space-y-4 sm:space-y-6">
			{/* Profile Information */}
			<Card className="border-border/50">
				<CardHeader className="p-3 sm:p-6">
					<CardTitle className="text-base sm:text-lg">Profil Pakar</CardTitle>
					<CardDescription className="text-xs sm:text-sm">Informasi mengenai kredibilitas dan pengalaman Anda sebagai pakar</CardDescription>
				</CardHeader>
				<CardContent className="p-3 sm:p-6 pt-0 sm:pt-0 space-y-3 sm:space-y-4">
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
						<div className="space-y-1.5 sm:space-y-2">
							<label className="text-xs sm:text-sm font-medium text-foreground">Tingkat Pendidikan</label>
							<Input
								placeholder="contoh: S2 Psikologi Klinis"
								value={profile.education}
								onChange={(e) => handleProfileChange("education", e.target.value)}
								className="bg-background border-border/50 text-sm"
							/>
						</div>

						<div className="space-y-1.5 sm:space-y-2">
							<label className="text-xs sm:text-sm font-medium text-foreground">Jumlah Pasien Ditangani</label>
							<Input
								type="number"
								placeholder="contoh: 500"
								value={profile.patientCount}
								onChange={(e) => handleProfileChange("patientCount", e.target.value)}
								className="bg-background border-border/50 text-sm"
							/>
						</div>

						<div className="space-y-1.5 sm:space-y-2">
							<label className="text-xs sm:text-sm font-medium text-foreground">Jumlah Publikasi</label>
							<Input
								type="number"
								placeholder="contoh: 12"
								value={profile.publications}
								onChange={(e) => handleProfileChange("publications", e.target.value)}
								className="bg-background border-border/50 text-sm"
							/>
						</div>

						<div className="space-y-1.5 sm:space-y-2">
							<label className="text-xs sm:text-sm font-medium text-foreground">Pengalaman (Tahun)</label>
							<Input
								type="number"
								placeholder="contoh: 10000"
								value={profile.experienceHours}
								onChange={(e) => handleProfileChange("experienceHours", e.target.value)}
								className="bg-background border-border/50 text-sm"
							/>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Influence Weights */}
			<Card className="border-border/50">
				<CardHeader className="p-3 sm:p-6">
					<CardTitle className="text-base sm:text-lg">Persentase Pengaruh terhadap Diagnosis</CardTitle>
					<CardDescription className="text-xs sm:text-sm">
						Tentukan seberapa besar pengaruh setiap faktor kredibilitas Anda dalam diagnosis
					</CardDescription>
				</CardHeader>
				<CardContent className="p-3 sm:p-6 pt-0 sm:pt-0 space-y-4 sm:space-y-6">
					{/* Education Weight */}
					<div className="space-y-2 sm:space-y-3">
						<div className="flex items-center justify-between">
							<label className="text-xs sm:text-sm font-medium text-foreground">Tingkat Pendidikan</label>
							<div className="flex items-center gap-1 sm:gap-2">
								<input
									type="number"
									min="0"
									max="100"
									value={weights.education}
									onChange={(e) => handleWeightChange("education", Number.parseInt(e.target.value))}
									className="w-10 sm:w-12 px-1 sm:px-2 py-1 rounded border border-border/50 bg-background text-xs sm:text-sm text-center"
								/>
								<span className="text-xs sm:text-sm text-muted-foreground">%</span>
							</div>
						</div>
						<Slider
							value={[weights.education]}
							onValueChange={(value) => handleWeightChange("education", value[0])}
							min={0}
							max={100}
							step={1}
							className="w-full"
						/>
					</div>

					{/* Patient Count Weight */}
					<div className="space-y-2 sm:space-y-3">
						<div className="flex items-center justify-between">
							<label className="text-xs sm:text-sm font-medium text-foreground">Jumlah Pasien</label>
							<div className="flex items-center gap-1 sm:gap-2">
								<input
									type="number"
									min="0"
									max="100"
									value={weights.patientCount}
									onChange={(e) => handleWeightChange("patientCount", Number.parseInt(e.target.value))}
									className="w-10 sm:w-12 px-1 sm:px-2 py-1 rounded border border-border/50 bg-background text-xs sm:text-sm text-center"
								/>
								<span className="text-xs sm:text-sm text-muted-foreground">%</span>
							</div>
						</div>
						<Slider
							value={[weights.patientCount]}
							onValueChange={(value) => handleWeightChange("patientCount", value[0])}
							min={0}
							max={100}
							step={1}
							className="w-full"
						/>
					</div>

					{/* Publications Weight */}
					<div className="space-y-2 sm:space-y-3">
						<div className="flex items-center justify-between">
							<label className="text-xs sm:text-sm font-medium text-foreground">Publikasi Ilmiah</label>
							<div className="flex items-center gap-1 sm:gap-2">
								<input
									type="number"
									min="0"
									max="100"
									value={weights.publications}
									onChange={(e) => handleWeightChange("publications", Number.parseInt(e.target.value))}
									className="w-10 sm:w-12 px-1 sm:px-2 py-1 rounded border border-border/50 bg-background text-xs sm:text-sm text-center"
								/>
								<span className="text-xs sm:text-sm text-muted-foreground">%</span>
							</div>
						</div>
						<Slider
							value={[weights.publications]}
							onValueChange={(value) => handleWeightChange("publications", value[0])}
							min={0}
							max={100}
							step={1}
							className="w-full"
						/>
					</div>

					{/* Experience Hours Weight */}
					<div className="space-y-2 sm:space-y-3">
						<div className="flex items-center justify-between">
							<label className="text-xs sm:text-sm font-medium text-foreground">Pengalaman</label>
							<div className="flex items-center gap-1 sm:gap-2">
								<input
									type="number"
									min="0"
									max="100"
									value={weights.experienceHours}
									onChange={(e) => handleWeightChange("experienceHours", Number.parseInt(e.target.value))}
									className="w-10 sm:w-12 px-1 sm:px-2 py-1 rounded border border-border/50 bg-background text-xs sm:text-sm text-center"
								/>
								<span className="text-xs sm:text-sm text-muted-foreground">%</span>
							</div>
						</div>
						<Slider
							value={[weights.experienceHours]}
							onValueChange={(value) => handleWeightChange("experienceHours", value[0])}
							min={0}
							max={100}
							step={1}
							className="w-full"
						/>
					</div>

					{/* Total Weight Indicator */}
					<div className="p-3 sm:p-4 bg-muted/30 rounded-lg border border-border/30">
						<div className="flex items-center justify-between mb-1 sm:mb-2">
							<p className="text-xs sm:text-sm font-medium text-foreground">Total Persentase</p>
							<p className={`font-semibold text-sm sm:text-base ${totalWeight === 100 ? "text-green-600" : "text-amber-600"}`}>
								{totalWeight}%
							</p>
						</div>
						{totalWeight !== 100 && (
							<p className="text-[10px] sm:text-xs text-muted-foreground">Total harus 100% untuk menyimpan profil</p>
						)}
					</div>

					<Button
						onClick={handleSaveProfile}
						className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm"
						disabled={totalWeight !== 100}
					>
						{isSaved ? "Tersimpan!" : "Simpan Profil Pakar"}
					</Button>
				</CardContent>
			</Card>

			{/* Summary */}
			<Card className="border-border/50 bg-primary/5">
				<CardHeader className="p-3 sm:p-6">
					<CardTitle className="text-sm sm:text-base">Ringkasan Kredibilitas</CardTitle>
				</CardHeader>
				<CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
					<div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
						<div className="min-w-0">
							<p className="text-muted-foreground">Pendidikan</p>
							<p className="font-semibold text-foreground truncate">{profile.education || "-"}</p>
						</div>
						<div className="min-w-0">
							<p className="text-muted-foreground">Pasien</p>
							<p className="font-semibold text-foreground">{profile.patientCount || "0"}</p>
						</div>
						<div className="min-w-0">
							<p className="text-muted-foreground">Publikasi</p>
							<p className="font-semibold text-foreground">{profile.publications || "0"}</p>
						</div>
						<div className="min-w-0">
							<p className="text-muted-foreground">Jam Kerja</p>
							<p className="font-semibold text-foreground">{profile.experienceHours || "0"}</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
