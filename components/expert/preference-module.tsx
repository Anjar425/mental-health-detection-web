"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Plus, Trash2, Edit2 } from 'lucide-react'
import axios from "axios"

interface PreferenceItem {
	questionCode: string
	questionText: string
	depression: number
	anxiety: number
	stress: number
}

const DASS21_QUESTIONS = [
	{ code: "Q1", text: "Saya menemukan diri saya menangis atau merasa sedih", category: "Depression" },
	{ code: "Q2", text: "Saya kehilangan minat pada hal-hal biasa saya", category: "Depression" },
	{ code: "Q3", text: "Saya merasa tidak berdaya dan tidak percaya diri", category: "Depression" },
	{ code: "Q4", text: "Saya khawatir bahwa saya akan menjadi salah satu orang yang 'tidak berhasil'", category: "Depression" },
	{ code: "Q5", text: "Saya merasa kehidupan saya tidak bermakna", category: "Depression" },
	{ code: "Q6", text: "Saya menemukan diri saya menjadi gugup", category: "Anxiety" },
	{ code: "Q7", text: "Saya sadar denyut jantung saya meningkat terlepas dari anggukan fisik", category: "Anxiety" },
	{ code: "Q8", text: "Saya merasa takut tanpa alasan yang baik", category: "Anxiety" },
	{ code: "Q9", text: "Saya merasa tubuh saya akan menjadi bencana", category: "Anxiety" },
	{ code: "Q10", text: "Saya menemukan diri saya menjadi panik", category: "Anxiety" },
	{ code: "Q11", text: "Saya menemukan diri saya mudah teriritasi", category: "Stress" },
	{ code: "Q12", text: "Saya merasa saya mengandalkan orang lain secara berlebihan", category: "Stress" },
	{ code: "Q13", text: "Saya merasa gugup dan bereaksi terhadap hal-hal", category: "Stress" },
	{ code: "Q14", text: "Saya sulit untuk memulai atau melanjutkan dengan hal-hal saya", category: "Stress" },
	{ code: "Q15", text: "Saya merasa saya kurang percaya diri", category: "Stress" },
	{ code: "Q16", text: "Saya merasa sedih dan tertekan", category: "Depression" },
	{ code: "Q17", text: "Saya tidak toleran terhadap hal-hal yang akan menghalangi saya dari menyelesaikan apa yang saya lakukan", category: "Stress" },
	{ code: "Q18", text: "Saya merasa saya putus asa", category: "Depression" },
	{ code: "Q19", text: "Saya tidak dapat menjadi antusias tentang apapun", category: "Depression" },
	{ code: "Q20", text: "Saya merasa saya tidak berharga sebagai orang", category: "Depression" },
	{ code: "Q21", text: "Saya sangat sensitif dengan apa yang dikatakan orang lain", category: "Anxiety" },
]

export function PreferenceModule() {
	const [preferences, setPreferences] = useState<PreferenceItem[]>([])

	const [selectedQuestion, setSelectedQuestion] = useState<string>("")
	const [depression, setDepression] = useState<number>(33)
	const [anxiety, setAnxiety] = useState<number>(34)
	const [stress, setStress] = useState<number>(33)
	const [isEditing, setIsEditing] = useState(false)

	const totalPercentage = depression + anxiety + stress

	useEffect(() => {
		const fetchPreferences = async () => {
			try {
				const token = sessionStorage.getItem("authToken");

				const res = await axios.get(
					`${process.env.NEXT_PUBLIC_API}/expert/preference`,
					{
						headers: {
							Authorization: `Bearer ${token}`
						}
					}
				);

				const data = res.data;

				const mapped = data.preferences.map((p: any) => {
					const question = DASS21_QUESTIONS[p.dass21_id - 1];
					return {
						id: `${p.dass21_id}`,
						questionCode: `Q${p.dass21_id}`,
						questionText: question.text,
						depression: p.percent_depression,
						anxiety: p.percent_anxiety,
						stress: p.percent_stress
					};
				});

				setPreferences(mapped);

			} catch (err) {
				console.error(err);
				// window.location.href = "/auth/login";
			}
		};

		fetchPreferences();
	}, []);

	const handleSelectQuestion = (code: string) => {
		const existing = preferences.find(p => p.questionCode === code);

		if (existing) {
			setDepression(existing.depression);
			setAnxiety(existing.anxiety);
			setStress(existing.stress);
		} else {
			setDepression(33);
			setAnxiety(34);
			setStress(33);
		}

		setSelectedQuestion(code);
	};

	const handleAddPreference = async () => {
		if (selectedQuestion && totalPercentage === 100) {
			const question = DASS21_QUESTIONS.find((q) => q.code === selectedQuestion);
			if (!question) return;

			const dass21_id = parseInt(selectedQuestion.replace("Q", ""), 10);

			try {
				const token = sessionStorage.getItem("authToken");

				await axios.post(
					`${process.env.NEXT_PUBLIC_API}/expert/preference`,
					{
						dass21_id: dass21_id,
						percent_depression: depression,
						percent_anxiety: anxiety,
						percent_stress: stress
					},
					{
						headers: {
							Authorization: `Bearer ${token}`
						}
					}
				);

				const newItem: PreferenceItem = {
					questionCode: question.code,
					questionText: question.text,
					depression,
					anxiety,
					stress
				};

				setPreferences((prev) => {
					const exists = prev.some(
						(item) => item.questionCode === question.code
					);

					if (exists) {
						return prev.map((item) =>
							item.questionCode === question.code ? newItem : item
						);
					}

					return [...prev, newItem];
				});

				setSelectedQuestion("");
			} catch (err) {
				console.error(err);
			}
		}
	};


	const handleEdit = (pref: PreferenceItem) => {
		setSelectedQuestion(pref.questionCode)
		setDepression(pref.depression)
		setAnxiety(pref.anxiety)
		setStress(pref.stress)
		setIsEditing(true)
	}

	// const handleDelete = (id: string) => {
	// 	setPreferences(preferences.filter((p) => p.id !== id))
	// }

	return (
		<div className="space-y-4 sm:space-y-6">
			{/* Input Form */}
			<Card className="border-border/50">
				<CardHeader className="p-3 sm:p-6">
					<CardTitle className="text-base sm:text-lg">Input Preferensi Pakar DASS-21</CardTitle>
					<CardDescription className="text-xs sm:text-sm">Tentukan bobot Depression, Anxiety, dan Stress untuk setiap pertanyaan DASS-21</CardDescription>
				</CardHeader>
				<CardContent className="p-3 sm:p-6 pt-0 sm:pt-0 space-y-4 sm:space-y-6">
					<div className="space-y-2">
						<label className="text-xs sm:text-sm font-medium text-foreground">Pilih Pertanyaan DASS-21 (Q1-Q21)</label>
						<div className="overflow-x-auto">
							<div className="grid grid-cols-5 sm:grid-cols-7 gap-1.5 sm:gap-2 min-w-max">
								{DASS21_QUESTIONS.map((question) => (
								<button
									key={question.code}
									onClick={() => handleSelectQuestion(question.code)}
									className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all border ${selectedQuestion === question.code
										? "bg-primary text-primary-foreground border-primary"
										: "bg-muted/50 text-foreground border-border/30 hover:border-primary/50"
										}`}
								>
									{question.code}
								</button>
							))}
							</div>
						</div>
						{selectedQuestion && (
							<div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-muted/30 rounded-lg border border-border/50">
								<p className="text-[10px] sm:text-xs text-muted-foreground mb-1">Pertanyaan yang dipilih:</p>
								<p className="text-xs sm:text-sm font-medium text-foreground">
									{DASS21_QUESTIONS.find((q) => q.code === selectedQuestion)?.text}
								</p>
							</div>
						)}
					</div>

					{selectedQuestion && (
						<div className="space-y-3 sm:space-y-4">
							<div>
								<label className="text-xs sm:text-sm font-medium text-foreground mb-2 sm:mb-3 block">
									Depresi: {depression}%
								</label>
								<Slider
									value={[depression]}
									onValueChange={(value) => {
										const newDep = value[0];
										const maxAllowed = 100 - (totalPercentage - depression);
										setDepression(Math.min(newDep, maxAllowed));
									}}
									min={0}
									max={100}
									step={1}
									className="w-full"
								/>
							</div>

							<div>
								<label className="text-xs sm:text-sm font-medium text-foreground mb-2 sm:mb-3 block">
									Kecemasan: {anxiety}%
								</label>
								<Slider
									value={[anxiety]}
									onValueChange={(value) => {
										const newAnx = value[0];
										const maxAllowed = 100 - (totalPercentage - anxiety);
										setAnxiety(Math.min(newAnx, maxAllowed));
									}}
									min={0}
									max={100}
									step={1}
									className="w-full"
								/>
							</div>

							<div>
								<label className="text-xs sm:text-sm font-medium text-foreground mb-2 sm:mb-3 block">
									Stres: {stress}%
								</label>
								<Slider
									value={[stress]}
									onValueChange={(value) => {
										const newStress = value[0];
										const maxAllowed = 100 - (totalPercentage - stress);
										setStress(Math.min(newStress, maxAllowed));
									}}
									min={0}
									max={100}
									step={1}
									className="w-full"
								/>
							</div>

							<div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-muted/30 rounded-lg border border-border/50">
								<p className="text-xs sm:text-sm font-medium text-foreground">
									Total Persentase: <span className={totalPercentage === 100 ? "text-green-600" : "text-destructive"}>{totalPercentage}%</span>
								</p>
								<p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Total harus 100% untuk bisa menambah preferensi</p>
							</div>
						</div>
					)}
					<Button
						onClick={handleAddPreference}
						className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2 text-xs sm:text-sm"
						disabled={!selectedQuestion || totalPercentage !== 100}
					>
						<Plus className="w-3 h-3 sm:w-4 sm:h-4" />
						{isEditing ? "Simpan Perubahan" : "Tambah Preferensi"}
					</Button>

				</CardContent>
			</Card>

			{/* Preferences List */}
			<Card className="border-border/50">
				<CardHeader className="p-3 sm:p-6">
					<CardTitle className="text-base sm:text-lg">Daftar Preferensi ({preferences.length})</CardTitle>
				</CardHeader>
				<CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
					<div className="space-y-2 sm:space-y-3">
						{preferences.map((pref) => (
							<div
								key={pref.questionCode}
								className="p-3 sm:p-4 border border-border/30 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors"
							>
								<div className="flex items-start justify-between gap-3 sm:gap-4 mb-2 sm:mb-3">
									<div className="flex-1">
										<div className="flex items-center gap-2 mb-1.5 sm:mb-2">
											<span className="inline-block px-1.5 sm:px-2 py-0.5 sm:py-1 rounded bg-primary/20 text-primary text-xs sm:text-sm font-semibold">
												{pref.questionCode}
											</span>
										</div>
										<p className="text-xs sm:text-sm text-foreground mb-2 sm:mb-3 leading-relaxed">{pref.questionText}</p>
										<div className="grid grid-cols-3 gap-1.5 sm:gap-3 text-xs sm:text-sm">
											<div className="p-1.5 sm:p-2 bg-blue-500/10 rounded border border-blue-500/30">
												<p className="text-muted-foreground text-[10px] sm:text-xs">Depresi</p>
												<p className="font-semibold text-foreground">{pref.depression}%</p>
											</div>
											<div className="p-1.5 sm:p-2 bg-orange-500/10 rounded border border-orange-500/30">
												<p className="text-muted-foreground text-[10px] sm:text-xs">Kecemasan</p>
												<p className="font-semibold text-foreground">{pref.anxiety}%</p>
											</div>
											<div className="p-1.5 sm:p-2 bg-red-500/10 rounded border border-red-500/30">
												<p className="text-muted-foreground text-[10px] sm:text-xs">Stres</p>
												<p className="font-semibold text-foreground">{pref.stress}%</p>
											</div>
										</div>
									</div>
									{/* <div className="flex gap-2">
										<Button variant="outline" size="sm" onClick={() => handleEdit(pref)} className="gap-1">
											<Edit2 className="w-4 h-4" />
										</Button>
										<Button
											variant="outline"
											size="sm"
											onClick={() => handleDelete(pref.id)}
											className="gap-1 text-destructive hover:text-destructive"
										>
											<Trash2 className="w-4 h-4" />
										</Button>
									</div> */}
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
