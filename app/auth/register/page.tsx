"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Shield, Eye, EyeOff, Check } from "lucide-react"
import { jwtDecode } from "jwt-decode"
import axios from "axios"

export default function ExpertRegisterPage() {
	const [formData, setFormData] = useState({
		username: "",
		email: "",
		password: "",
		confirmPassword: "",
		role: "",
	})

	const [showPassword, setShowPassword] = useState(false)
	const [showConfirmPassword, setShowConfirmPassword] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState("")
	const [success, setSuccess] = useState(false)

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
		const { name, value } = e.target
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}))
	}

	const validateForm = () => {
		if (!formData.username.trim()) {
			setError("Nama lengkap harus diisi")
			return false
		}
		if (!formData.email.trim()) {
			setError("Email harus diisi")
			return false
		}
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
			setError("Format email tidak valid")
			return false
		}
		if (!formData.password) {
			setError("Password harus diisi")
			return false
		}
		if (formData.password.length < 6) {
			setError("Password minimal 6 karakter")
			return false
		}
		if (formData.password !== formData.confirmPassword) {
			setError("Password dan konfirmasi password tidak sama")
			return false
		}
		if (!formData.role.trim()) {
			setError("Spesialisasi harus dipilih")
			return false
		}
		return true
	}

	const handleRegister = async (e: React.FormEvent) => {
		e.preventDefault()
		setError("")
		setSuccess(false)

		if (!validateForm()) return

		setIsLoading(true)

		try {
			const res = await axios.post(`${process.env.NEXT_PUBLIC_API}/auth/register`, {
				username: formData.username,
				email: formData.email,
				password: formData.password,
				role: formData.role,
			})

			const token: string = res.data.access_token

			if (!token) {
				setError("Token tidak ditemukan dari server.")
				return
			}

			// simpan hanya TOKEN
			sessionStorage.setItem("authToken", token)

			const decoded: any = jwtDecode(token)

			setSuccess(true)

			setTimeout(() => {
				if (decoded.role === "expert") {
					window.location.href = "/expert/dashboard"
				} else {
					window.location.href = "/user/dashboard"
				}
			}, 1200)

		} catch (err: any) {
			setError(
				err?.response?.data?.detail ||
				"Registrasi gagal, coba lagi."
			)
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<main className="min-h-screen bg-linear-to-br from-background via-background to-muted/30 flex items-center justify-center px-3 sm:px-4 py-6 sm:py-12">
			<div className="max-w-md w-full">
				<div className="text-center mb-6 sm:mb-8">
					<div className="flex items-center justify-center mb-3 sm:mb-4">
						<Shield className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
					</div>
					<h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Daftar</h1>
					<p className="text-xs sm:text-sm text-muted-foreground">Buat akun untuk mengelola kesehatan mental</p>
				</div>

				<Card className="border-border/50 shadow-lg">
					<CardHeader>
						<CardTitle>Buat Akun Baru</CardTitle>
						<CardDescription>Isi form di bawah untuk mendaftar</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleRegister} className="space-y-4">
							{error && (
								<div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">
									{error}
								</div>
							)}

							{success && (
								<div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-sm text-green-700 dark:text-green-400 flex items-center gap-2">
									<Check className="w-4 h-4" />
									Registrasi berhasil! Mengarahkan ke dashboard...
								</div>
							)}

							{/* Nama Lengkap */}
							<div className="space-y-2">
								<label className="text-sm font-medium text-foreground">Nama Lengkap</label>
								<Input
									type="text"
									name="username"
									placeholder="masukan nama anda"
									value={formData.username}
									onChange={handleChange}
									className="bg-background border-border/50"
									required
								/>
							</div>

							{/* Email */}
							<div className="space-y-2">
								<label className="text-sm font-medium text-foreground">Email</label>
								<Input
									type="email"
									name="email"
									placeholder="masukan email anda"
									value={formData.email}
									onChange={handleChange}
									className="bg-background border-border/50"
									required
								/>
							</div>

							{/* Spesialisasi */}
							<div className="space-y-2">
								<label className="text-sm font-medium text-foreground">Role</label>
								<select
									name="role"
									value={formData.role}
									onChange={handleChange}
									className="w-full px-3 py-2 rounded-lg bg-background border border-border/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
									required
								>
									<option value="">Pilih Peranan</option>
									<option value="user">Pengguna Biasa</option>
									<option value="expert">Pakar Psikologi</option>
								</select>
							</div>

							{/* Password */}
							<div className="space-y-2">
								<label className="text-sm font-medium text-foreground">Password</label>
								<div className="relative">
									<Input
										type={showPassword ? "text" : "password"}
										name="password"
										placeholder="masukan password"
										value={formData.password}
										onChange={handleChange}
										className="bg-background border-border/50 pr-10"
										required
									/>
									<button
										type="button"
										onClick={() => setShowPassword(!showPassword)}
										className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
									>
										{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
									</button>
								</div>
							</div>

							{/* Konfirmasi Password */}
							<div className="space-y-2">
								<label className="text-sm font-medium text-foreground">Konfirmasi Password</label>
								<div className="relative">
									<Input
										type={showConfirmPassword ? "text" : "password"}
										name="confirmPassword"
										placeholder="konfirmasi ulang password"
										value={formData.confirmPassword}
										onChange={handleChange}
										className="bg-background border-border/50 pr-10"
										required
									/>
									<button
										type="button"
										onClick={() => setShowConfirmPassword(!showConfirmPassword)}
										className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
									>
										{showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
									</button>
								</div>
							</div>

							<Button
								type="submit"
								className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-10 font-semibold rounded-lg"
								disabled={isLoading || success}
							>
								{isLoading ? "Memproses..." : success ? "Berhasil!" : "Daftar"}
							</Button>
						</form>

						<div className="mt-6 text-center text-sm text-muted-foreground">
							Sudah punya akun?{" "}
							<Link href="/auth/login" className="text-primary hover:underline font-medium">
								Login di sini
							</Link>
						</div>
					</CardContent>
				</Card>
			</div>
		</main>
	)
}
