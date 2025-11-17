"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Brain, Zap } from 'lucide-react'

interface SystemSelectionModalProps {
	open: boolean
	onClose: () => void
	onSelectSystem: (system: "dass21" | "dass42") => void
}

export function SystemSelectionModal({ open, onClose, onSelectSystem }: SystemSelectionModalProps) {
	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="max-w-4xl min-w-xl md:min-w-3xl">
				<DialogHeader>
					<DialogTitle className="text-2xl">Pilih Sistem Deteksi</DialogTitle>
					<DialogDescription>
						Pilih sistem yang sesuai dengan kebutuhan Anda untuk memulai deteksi kesehatan mental
					</DialogDescription>
				</DialogHeader>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
					{/* DASS-21 System - Decision Support */}
					<div
						onClick={() => {
							onSelectSystem("dass21")
							onClose()
						}}
						className="cursor-pointer group relative p-6 rounded-lg border-2 border-border hover:border-primary transition-all hover:bg-primary/5 text-left"
					>
						<div className="flex items-start gap-4">
							<div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
								<Brain className="w-6 h-6 text-blue-600 dark:text-blue-400" />
							</div>
							<div className="flex-1">
								<h3 className="text-lg font-semibold text-foreground mb-2">Sistem Pendukung Keputusan</h3>
								<p className="text-sm text-muted-foreground mb-4">Menggunakan DASS-21</p>
								<ul className="text-xs text-muted-foreground space-y-1 mb-4">
									<li>• 21 pertanyaan kesehatan mental</li>
									<li>• Cepat dan efisien</li>
									<li>• Hasil berdasarkan preferensi pakar</li>
								</ul>
								<Button
									variant="default"
									size="sm"
									className="w-full bg-blue-600 hover:bg-blue-700 cursor-pointer"
								>
									Mulai DASS-21
								</Button>
							</div>
						</div>
					</div>

					{/* DASS-42 System - Expert System */}
					<div
						onClick={() => {
							onSelectSystem("dass42")
							onClose()
						}}
						className="cursor-pointer group relative  p-6 rounded-lg border-2 border-border hover:border-primary transition-all hover:bg-primary/5 text-left"
					>
						<div className="flex h-full items-start gap-4">
							<div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/30 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/50 transition-colors">
								<Zap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
							</div>
							<div className="flex flex-1 justify-between flex-col h-full">
								<h3 className="text-lg font-semibold text-foreground mb-2">Sistem Kepakaran</h3>
								<p className="text-sm text-muted-foreground mb-4">Menggunakan DASS-42</p>
								<ul className="text-xs text-muted-foreground space-y-1 mb-4">
									<li>• 42 pertanyaan komprehensif</li>
									<li>• Analisis mendalam berbasis expert</li>
									<li>• Hasil lebih detail dan akurat</li>
								</ul>
								<Button
									variant="default"
									size="sm"
									className="w-full bg-purple-600 hover:bg-purple-700 cursor-pointer"
								>
									Mulai DASS-42
								</Button>
							</div>
						</div>
					</div>
				</div>

				<div className="mt-8 p-4 rounded-lg bg-muted/50">
					<p className="text-xs text-muted-foreground text-center">
						Kedua sistem telah dikembangkan berdasarkan penelitian ilmiah dan direkomendasikan oleh profesional kesehatan mental.
					</p>
				</div>
			</DialogContent>
		</Dialog>
	)
}
