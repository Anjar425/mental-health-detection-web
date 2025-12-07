"use client"

import { Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"

interface DASS21Record {
	id: string
	date: string
	timestamp: string
	depression: number
	anxiety: number
	stress: number
	dominant: "Depresi" | "Ansietas" | "Stres"
	notes?: string
}

interface DASS42Record {
	id: string
	date: string
	timestamp: string
	depression: { level: string; score: number }
	anxiety: { level: string; score: number }
	stress: { level: string; score: number }
	dominant: "Depresi" | "Ansietas" | "Stres"
	notes?: string
}

type DetectionRecord = DASS21Record | DASS42Record

interface HistoryListProps {
	records: DetectionRecord[]
	type: "dass21" | "dass42"
}

const getSeverityColor = (level: string) => {
	switch (level) {
		case "Normal":
			return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
		case "Mild":
			return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
		case "Moderate":
			return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
		case "Severe":
			return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
		case "Extremely Severe":
			return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
		default:
			return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
	}
}

const getDominantColor = (dominant: string): string => {
	switch (dominant) {
		case "Depresi":
			return "bg-blue-50 dark:bg-blue-950/20 border-l-4 border-l-blue-500"
		case "Ansietas":
			return "bg-purple-50 dark:bg-purple-950/20 border-l-4 border-l-purple-500"
		case "Stres":
			return "bg-amber-50 dark:bg-amber-950/20 border-l-4 border-l-amber-500"
		default:
			return ""
	}
}

export function HistoryList({ records, type }: HistoryListProps) {
	if (records.length === 0) {
		return (
			<div className="text-center py-12 rounded-lg border border-border/40 bg-muted/20">
				<Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
				<p className="text-muted-foreground mb-4">Belum ada riwayat deteksi</p>
				<p className="text-xs text-muted-foreground">
					Mulai deteksi baru untuk melihat riwayat di sini
				</p>
			</div>
		)
	}

	if (type === "dass21") {
		return (
			<div className="space-y-3">
				{records.map((record) => {
					const das21Record = record as DASS21Record
					return (
						<Card
							key={record.id}
							className={`border-border/40 hover:border-border/60 transition-colors ${getDominantColor(record.dominant)}`}
						>
							<CardHeader className="pb-3">
								<div className="flex items-start justify-between">
									<div className="flex items-center gap-2">
										<Calendar className="w-4 h-4 text-muted-foreground" />
										<div>
											<p className="text-sm font-medium text-foreground">{record.date}</p>
											<p className="text-xs text-muted-foreground">{record.timestamp}</p>
										</div>
									</div>
									<Badge variant="secondary">{record.dominant}</Badge>
								</div>
							</CardHeader>
							<CardContent className="space-y-3">
								{/* Scores Grid */}
								<div className="grid grid-cols-3 gap-2">
									<div className="p-2 rounded border border-border/40 text-center">
										<p className="text-xs text-muted-foreground mb-1">Depresi</p>
										<p className="text-lg font-bold text-blue-600 dark:text-blue-400">
											{das21Record.depression}%
										</p>
									</div>
									<div className="p-2 rounded border border-border/40 text-center">
										<p className="text-xs text-muted-foreground mb-1">Ansietas</p>
										<p className="text-lg font-bold text-purple-600 dark:text-purple-400">
											{das21Record.anxiety}%
										</p>
									</div>
									<div className="p-2 rounded border border-border/40 text-center">
										<p className="text-xs text-muted-foreground mb-1">Stres</p>
										<p className="text-lg font-bold text-amber-600 dark:text-amber-400">
											{das21Record.stress}%
										</p>
									</div>
								</div>

								{/* Notes */}
								{record.notes && (
									<div className="bg-muted/50 p-2 rounded text-xs text-muted-foreground border-l-2 border-l-primary">
										<span className="font-medium">Catatan:</span> {record.notes}
									</div>
								)}
							</CardContent>
						</Card>
					)
				})}
			</div>
		)
	}

	// DASS-42 Table View
	return (
		<div className="rounded-lg border border-border/40 overflow-hidden">
			<Table>
				<TableHeader className="bg-muted/50">
					<TableRow>
						<TableHead className="text-xs">Tanggal</TableHead>
						<TableHead className="text-xs">Depresi</TableHead>
						<TableHead className="text-xs">Ansietas</TableHead>
						<TableHead className="text-xs">Stres</TableHead>
						<TableHead className="text-xs">Dominan</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{records.map((record) => {
						const dass42Record = record as DASS42Record
						return (
							<TableRow
								key={record.id}
								className={`hover:bg-muted/50 transition-colors ${getDominantColor(record.dominant)}`}
							>
								<TableCell className="text-xs">
									<div>
										<p className="font-medium">{record.date}</p>
										<p className="text-muted-foreground text-xs">{record.timestamp}</p>
									</div>
								</TableCell>
								<TableCell className="text-xs">
									<div className="space-y-1">
										<p className="font-medium">{dass42Record.depression.score}</p>
										<Badge
											variant="secondary"
											className={`text-xs ${getSeverityColor(dass42Record.depression.level)}`}
										>
											{dass42Record.depression.level}
										</Badge>
									</div>
								</TableCell>
								<TableCell className="text-xs">
									<div className="space-y-1">
										<p className="font-medium">{dass42Record.anxiety.score}</p>
										<Badge
											variant="secondary"
											className={`text-xs ${getSeverityColor(dass42Record.anxiety.level)}`}
										>
											{dass42Record.anxiety.level}
										</Badge>
									</div>
								</TableCell>
								<TableCell className="text-xs">
									<div className="space-y-1">
										<p className="font-medium">{dass42Record.stress.score}</p>
										<Badge
											variant="secondary"
											className={`text-xs ${getSeverityColor(dass42Record.stress.level)}`}
										>
											{dass42Record.stress.level}
										</Badge>
									</div>
								</TableCell>
								<TableCell className="text-xs">
									<Badge variant="outline">{record.dominant}</Badge>
								</TableCell>
							</TableRow>
						)
					})}
				</TableBody>
			</Table>

			{/* Notes Section */}
			{records.some((r) => r.notes) && (
				<div className="p-3 border-t border-border/40 bg-muted/20 space-y-2">
					{records
						.filter((r) => r.notes)
						.map((record) => (
							<div key={record.id} className="text-xs text-muted-foreground border-l-2 border-l-primary pl-2">
								<span className="font-medium">{record.date}:</span> {record.notes}
							</div>
						))}
				</div>
			)}
		</div>
	)
}
