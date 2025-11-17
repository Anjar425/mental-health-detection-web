"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, Edit2, X } from 'lucide-react'
import axios from "axios"

interface Premise {
	id: string
	prefix: "No Prefix" | "Not"
	questionnaire: string
	severity: "Low" | "Medium" | "High"
	conjunction: "AND" | "OR" | "THEN"
}

interface Conclusion {
	category: "Anxiety" | "Depression" | "Stress"
	severity: "Normal" | "Mild" | "Moderate" | "Severe" | "Extreme"
}

interface RuleItem {
	id: string
	premises: Premise[]
	conclusion: Conclusion
}

const prefixMap: Record<string, Premise["prefix"]> = {
	no_prefix: "No Prefix",
	not: "Not",
}

const levelMap: Record<string, Premise["severity"]> = {
	low: "Low",
	med: "Medium",
	high: "High",
}

const conjMap: Record<string, Premise["conjunction"]> = {
	and: "AND",
	or: "OR",
	then: "THEN",
}

function reverseMap<T extends Record<string, string>>(obj: T) {
	return Object.fromEntries(
		Object.entries(obj).map(([key, value]) => [value, key])
	) as Record<T[keyof T], keyof T>;
}


const QUESTIONNAIRE_OPTIONS = Array.from({ length: 42 }, (_, i) => `Q${i + 1}`)
const CATEGORIES = ["Anxiety", "Depression", "Stress"] as const
const SEVERITY_LEVELS_PREMISE = ["Low", "Medium", "High"] as const
const SEVERITY_LEVELS_CONCLUSION = ["Normal", "Mild", "Moderate", "Severe", "Extreme"] as const

export function RulesetModule() {
	const [rules, setRules] = useState<RuleItem[]>([])

	useEffect(() => {
		const expertToken = sessionStorage.getItem("authToken");

		const fetchRules = async () => {
			try {
				const res = await axios.get(`${process.env.NEXT_PUBLIC_API}/ruleset`,
					{
						headers: {
							Authorization: `Bearer ${expertToken}`,
						},
					}
				)

				const data = res.data

				const mapped: RuleItem[] = data.map((item: any) => ({
					id: String(item.rule_id),

					premises: item.rules.premises.map((p: any, index: number) => ({
						id: `p${index + 1}`,
						prefix: prefixMap[p.prefix],
						questionnaire: `Q${p.dass42_id}`,
						severity: levelMap[p.level],
						conjunction: conjMap[p.conjunction],
					})),

					conclusion: {
						category: item.rules.conclusion.category,
						severity: item.rules.conclusion.severity,
					},
				}))

				setRules(mapped)
			} catch (error) {
				console.error("Failed to fetch rules:", error)
			}
		}

		fetchRules()
	}, [])

	const [premises, setPremises] = useState<Premise[]>([
		{ id: "temp1", prefix: "No Prefix", questionnaire: "Q1", severity: "Low", conjunction: "AND" },
	])
	const [conclusion, setConclusion] = useState<Conclusion>({ category: "Anxiety", severity: "Normal" })

	const [isEditing, setIsEditing] = useState(false)
	const [editingId, setEditingId] = useState<string | null>(null)
	const [successMessage, setSuccessMessage] = useState<string | null>(null)


	const handleAddPremise = () => {
		const newPremise: Premise = {
			id: `temp${Date.now()}`,
			prefix: "No Prefix",
			questionnaire: "Q1",
			severity: "Low",
			conjunction: "AND",
		}
		setPremises([...premises, newPremise])
	}

	const handleRemovePremise = (id: string) => {
		if (premises.length > 1) {
			const updatedPremises = premises.filter((p) => p.id !== id)
			setPremises(updatedPremises)
		}
	}

	const handleUpdatePremise = (id: string, field: keyof Premise, value: string) => {
		setPremises(
			premises.map((p) =>
				p.id === id ? { ...p, [field]: value } : p
			)
		)
	}

	const handleSaveRule = async () => {
		if (premises.length > 0 && premises[premises.length - 1].conjunction !== "THEN") {
			alert("Premis terakhir harus memiliki konjungsi 'THEN'")
			return
		}

		if (premises.length === 0) {
			alert("Minimal harus ada satu premis")
			return
		}

		const prefixReverseMap = reverseMap(prefixMap)
		const levelReverseMap = reverseMap(levelMap)
		const conjReverseMap = reverseMap(conjMap)

		const payload = {
			rule_id: isEditing ? editingId : null,
			premises: premises.map((p) => ({
				dass42_id: parseInt(p.questionnaire.replace("Q", ""), 10),
				prefix: prefixReverseMap[p.prefix],
				level: levelReverseMap[p.severity],
				conjunction: conjReverseMap[p.conjunction],
			})),
			conclusion: {
				category: conclusion.category,
				severity: conclusion.severity,
			},
		}

		console.log(payload)

		const expertToken = sessionStorage.getItem("authToken");

		try {
			const response = await axios.post(`${process.env.NEXT_PUBLIC_API}/ruleset`, payload,
				{
					headers: {
						Authorization: `Bearer ${expertToken}`,
					},
				},
			)

			setPremises([
				{
					id: "temp1",
					prefix: "No Prefix",
					questionnaire: "Q1",
					severity: "Low",
					conjunction: "AND",
				},
			])

			const newPremisesFE = payload.premises.map((p, index) => ({
				id: String(index),
				prefix: prefixMap[p.prefix],           // contoh: "no_prefix" → "No Prefix"
				questionnaire: "Q" + p.dass42_id,
				severity: levelMap[p.level],           // contoh: "low" → "Low"
				conjunction: conjMap[p.conjunction],   // contoh: "then" → "THEN"
			}));

			const newConclusionFE = {
				category: payload.conclusion.category as Conclusion["category"],
				severity: payload.conclusion.severity as Conclusion["severity"],
			};

			if (isEditing && editingId) {
				// UPDATE RULE
				setRules((prev) =>
					prev.map((r) =>
						r.id === editingId
							? {
								id: editingId,
								premises: newPremisesFE,
								conclusion: newConclusionFE,
							}
							: r
					)
				);
			} else {
				// CREATE RULE
				const newRule: RuleItem = {
					id: String(response.data.rule_id),
					premises: newPremisesFE,
					conclusion: newConclusionFE,
				};

				setRules((prev) => [...prev, newRule]);
			}

			setConclusion({ category: "Anxiety", severity: "Normal" })
			setSuccessMessage(isEditing ? "Rule berhasil diperbarui." : "Rule baru berhasil ditambahkan.")
			setIsEditing(false)
			setEditingId(null)
		} catch (err) {
			console.error(err)
			alert("Gagal menyimpan rule")
		}
	}

	const handleEdit = (rule: RuleItem) => {
		setPremises(rule.premises)
		setConclusion(rule.conclusion)
		setIsEditing(true)
		setEditingId(rule.id)
	}

	const handleDelete = (id: string) => {
		setRules(rules.filter((r) => r.id !== id))
	}

	const handleCancel = () => {
		setPremises([{ id: "temp1", prefix: "No Prefix", questionnaire: "Q1", severity: "Low", conjunction: "AND" }])
		setConclusion({ category: "Anxiety", severity: "Normal" })
		setIsEditing(false)
		setEditingId(null)
	}

	const hasThenConjunction = premises.some((p) => p.conjunction === "THEN")

	return (
		<div className="space-y-6">
			{/* Input Form */}
			<Card className="border-border/50">
				<CardHeader>
					<CardTitle>Input Ruleset DASS-42</CardTitle>
					<CardDescription>Buat aturan dengan premis kompleks menggunakan AND/OR/THEN logic</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* Premises Section */}
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<h3 className="font-semibold text-foreground">Premis (Conditions)</h3>
						</div>

						<div className="space-y-3 p-4 bg-muted/30 rounded-lg border border-border/30">
							{premises.map((premise, index) => (
								<div key={premise.id} className="space-y-3 p-3 bg-background rounded-lg border border-border/20">
									<div className="grid grid-cols-1 md:grid-cols-5 gap-3">
										{/* Prefix */}
										<div className="space-y-2">
											<label className="text-xs font-medium text-muted-foreground">Prefix</label>
											<Select
												value={premise.prefix}
												onValueChange={(value) =>
													handleUpdatePremise(premise.id, "prefix", value as "No Prefix" | "Not")
												}
											>
												<SelectTrigger className="bg-background border-border/50 h-9">
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="No Prefix">No Prefix</SelectItem>
													<SelectItem value="Not">Not</SelectItem>
												</SelectContent>
											</Select>
										</div>

										{/* Questionnaire */}
										<div className="space-y-2">
											<label className="text-xs font-medium text-muted-foreground">Kuisioner</label>
											<Select
												value={premise.questionnaire}
												onValueChange={(value) =>
													handleUpdatePremise(premise.id, "questionnaire", value)
												}
											>
												<SelectTrigger className="bg-background border-border/50 h-9">
													<SelectValue />
												</SelectTrigger>
												<SelectContent className="max-h-60">
													{QUESTIONNAIRE_OPTIONS.map((q) => (
														<SelectItem key={q} value={q}>
															{q}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>

										{/* Severity */}
										<div className="space-y-2">
											<label className="text-xs font-medium text-muted-foreground">Tingkat Keparahan</label>
											<Select
												value={premise.severity}
												onValueChange={(value) =>
													handleUpdatePremise(premise.id, "severity", value as "Low" | "Medium" | "High")
												}
											>
												<SelectTrigger className="bg-background border-border/50 h-9">
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="Low">Low</SelectItem>
													<SelectItem value="Medium">Medium</SelectItem>
													<SelectItem value="High">High</SelectItem>
												</SelectContent>
											</Select>
										</div>

										{/* Conjunction */}
										<div className="space-y-2">
											<label className="text-xs font-medium text-muted-foreground">Konjungsi</label>
											<Select
												value={premise.conjunction}
												onValueChange={(value) =>
													handleUpdatePremise(premise.id, "conjunction", value as "AND" | "OR" | "THEN")
												}
											>
												<SelectTrigger className="bg-background border-border/50 h-9">
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="AND">AND</SelectItem>
													<SelectItem value="OR">OR</SelectItem>
													{index === premises.length - 1 && (
														<SelectItem value="THEN">THEN</SelectItem>
													)}
												</SelectContent>
											</Select>
										</div>

										{/* Remove Button */}
										<div className="flex items-end">
											{premises.length > 1 && (
												<Button
													variant="ghost"
													size="sm"
													onClick={() => handleRemovePremise(premise.id)}
													className="text-destructive hover:text-destructive"
												>
													<X className="w-4 h-4" />
												</Button>
											)}
										</div>
									</div>
								</div>
							))}

							<Button
								variant="outline"
								onClick={handleAddPremise}
								className="w-full gap-2"
								disabled={hasThenConjunction}
							>
								<Plus className="w-4 h-4" />
								Tambah Premis
							</Button>
						</div>
					</div>

					{/* Conclusion Section */}
					<div className="space-y-4">
						<h3 className="font-semibold text-foreground">Konklusi (Conclusion)</h3>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg border border-border/30">
							{/* Category */}
							<div className="space-y-2">
								<label className="text-sm font-medium text-foreground">Kategori</label>
								<Select
									value={conclusion.category}
									onValueChange={(value) =>
										setConclusion({ ...conclusion, category: value as "Anxiety" | "Depression" | "Stress" })
									}
								>
									<SelectTrigger className="bg-background border-border/50">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{CATEGORIES.map((cat) => (
											<SelectItem key={cat} value={cat}>
												{cat}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							{/* Severity */}
							<div className="space-y-2">
								<label className="text-sm font-medium text-foreground">Tingkat Keparahan</label>
								<Select
									value={conclusion.severity}
									onValueChange={(value) =>
										setConclusion({ ...conclusion, severity: value as "Normal" | "Mild" | "Moderate" | "Severe" | "Extreme" })
									}
								>
									<SelectTrigger className="bg-background border-border/50">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{SEVERITY_LEVELS_CONCLUSION.map((sev) => (
											<SelectItem key={sev} value={sev}>
												{sev}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>
					</div>

					{/* Action Buttons */}
					<div className="flex gap-3">
						<Button
							onClick={handleSaveRule}
							className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
						>
							<Plus className="w-4 h-4" />
							{isEditing ? "Simpan Perubahan" : "Tambah Ruleset"}
						</Button>
						{isEditing && (
							<Button
								variant="outline"
								onClick={handleCancel}
							>
								Batal
							</Button>
						)}
					</div>
					{successMessage && (
						<div
							className="mb-4 p-3 rounded-lg border border-green-500/40 bg-green-500/10 text-green-700 
                   shadow transition-opacity duration-700 animate-fade"
						>
							<p className="text-sm font-semibold">{successMessage}</p>
							<p className="text-xs opacity-80 mt-1">
								Perubahan berhasil disimpan.
							</p>
						</div>
					)}

				</CardContent>
			</Card>

			{/* Rules List */}
			<Card className="border-border/50">
				<CardHeader>
					<CardTitle>Daftar Ruleset ({rules.length})</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-3">
						{rules.map((rule) => (
							<div
								key={rule.id}
								className="p-4 border border-border/30 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors"
							>
								<div className="flex items-start justify-between gap-4">
									<div className="flex-1 min-w-0">
										{/* Rule Logic Display */}
										<div className="mb-3 p-3 bg-background rounded border border-border/20">
											<p className="text-sm font-mono text-foreground">
												{rule.premises.map((p, idx) => (
													<span key={p.id}>
														{p.prefix === "Not" && <span className="text-amber-600">NOT </span>}
														<span className="text-blue-600">{p.questionnaire}</span>
														<span className="text-gray-600"> ({p.severity})</span>
														{p.conjunction && (
															<span className={p.conjunction === "THEN" ? " text-red-600" : " text-purple-600"}>
																{" "}{p.conjunction}{" "}
															</span>
														)}
													</span>
												))}
											</p>
										</div>

										{/* Conclusion */}
										<div className="flex items-center gap-2">
											<span className="text-sm font-medium text-foreground">Hasil:</span>
											<span className="text-sm px-3 py-1 rounded-full bg-primary/20 text-primary">
												{rule.conclusion.category}
											</span>
											<span
												className={`text-xs px-2 py-1 rounded-full ${rule.conclusion.severity === "Severe" || rule.conclusion.severity === "Extreme"
													? "bg-destructive/20 text-destructive"
													: rule.conclusion.severity === "Moderate"
														? "bg-amber-500/20 text-amber-700"
														: "bg-secondary/20 text-secondary-foreground"
													}`}
											>
												{rule.conclusion.severity}
											</span>
										</div>
									</div>

									{/* Action Buttons */}
									<div className="flex gap-2">
										<Button variant="outline" size="sm" onClick={() => handleEdit(rule)} className="gap-1">
											<Edit2 className="w-4 h-4" />
										</Button>
										{/* <Button
											variant="outline"
											size="sm"
											onClick={() => handleDelete(rule.id)}
											className="gap-1 text-destructive hover:text-destructive"
										>
											<Trash2 className="w-4 h-4" />
										</Button> */}
									</div>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
