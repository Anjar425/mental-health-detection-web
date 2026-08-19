"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Shield, Eye, EyeOff } from "lucide-react"
import { jwtDecode } from "jwt-decode"

type JwtPayload = {
	role: "admin" | "expert" | "user"
	exp: number
}

export default function ExpertLoginPage() {
	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const [showPassword, setShowPassword] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState("")

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault()
		setError("")
		setIsLoading(true)

		try {
			const response = await fetch(`${process.env.NEXT_PUBLIC_API}/auth/login`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email, password }),
			})

			if (!response.ok) {
				throw new Error("Login failed")
			}

			const data = await response.json()

			if (!data.access_token) {
				throw new Error("Token not found")
			}

			sessionStorage.setItem("authToken", data.access_token)

			const decoded = jwtDecode<JwtPayload>(data.access_token)

			switch (decoded.role) {
				case "admin":
					window.location.href = "/admin/"
					break
				case "expert":
					window.location.href = "/expert/dashboard"
					break
				case "user":
					window.location.href = "/user/dashboard"
					break
				default:
					throw new Error("Unknown role")
			}
		} catch (err) {
			const errorMessage =
				err instanceof Error
					? err.message
					: "Login failed. Please check your credentials."
			setError(errorMessage)
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
					<h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Login</h1>
					<p className="text-xs sm:text-sm text-muted-foreground">
						Akses dashboard sesuai dengan peran Anda
					</p>
				</div>

				<Card className="border-border/50 shadow-lg">
					<CardHeader>
						<CardTitle>Masuk</CardTitle>
						<CardDescription>Gunakan kredensial Anda untuk login</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleLogin} className="space-y-4">
							{error && (
								<div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">
									{error}
								</div>
							)}

							<div className="space-y-2">
								<label className="text-sm font-medium">Email</label>
								<Input
									type="email"
									placeholder="email@example.com"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
								/>
							</div>

							<div className="space-y-2">
								<label className="text-sm font-medium">Password</label>
								<div className="relative">
									<Input
										type={showPassword ? "text" : "password"}
										placeholder="••••••••"
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										className="pr-10"
										required
									/>
									<button
										type="button"
										onClick={() => setShowPassword(!showPassword)}
										className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
									>
										{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
									</button>
								</div>
							</div>

							<Button
								type="submit"
								className="w-full"
								disabled={isLoading}
							>
								{isLoading ? "Memproses..." : "Login"}
							</Button>
						</form>

						<div className="mt-6 text-center text-sm text-muted-foreground">
							Belum punya akun?{" "}
							<Link href="/auth/register" className="text-primary hover:underline font-medium">
								Daftar di sini
							</Link>
						</div>
					</CardContent>
				</Card>
			</div>
		</main>
	)
}
