"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Shield, Eye, EyeOff } from "lucide-react"

export default function ExpertLoginPage() {
	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const [showPassword, setShowPassword] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState("")

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(""); 
		setIsLoading(true);

		try {
			if (email && password) {
				const response = await fetch(`${process.env.NEXT_PUBLIC_API}/auth/login`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						email,
						password,
					}),
				});

				if (!response.ok) {
					throw new Error('Login failed');
				}

				const data = await response.json();

				if (data.access_token) {
					sessionStorage.setItem("expertToken", data.access_token);

					window.location.href = "/expert/dashboard";
				} else {
					setError("Token not found, login failed.");
				}
			} else {
				setError("Email and password are required");
			}
		} catch (err) {
			// Ensure we are rendering the error message as a string
			const errorMessage = err instanceof Error ? err.message : "Login Failed! Make sure your email and password are correct ";
			setError(errorMessage);
		} finally {
			setIsLoading(false); // Stop loading state
		}
	};

	return (
		<main className="min-h-screen bg-linear-to-br from-background via-background to-muted/30 flex items-center justify-center px-4 py-12">
			<div className="max-w-md w-full">
				<div className="text-center mb-8">
					<div className="flex items-center justify-center mb-4">
						<Shield className="w-10 h-10 text-primary" />
					</div>
					<h1 className="text-3xl font-bold text-foreground mb-2">Login</h1>
					<p className="text-sm text-muted-foreground">Akses dashboard untuk mengelola keperluan anda</p>
				</div>

				<Card className="border-border/50 shadow-lg">
					<CardHeader>
						<CardTitle>Masuk ke Akun Pakar</CardTitle>
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
								<label className="text-sm font-medium text-foreground">Email</label>
								<Input
									type="email"
									placeholder="pakar@mindcare.com"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									className="bg-background border-border/50"
									required
								/>
							</div>

							<div className="space-y-2">
								<label className="text-sm font-medium text-foreground">Password</label>
								<div className="relative">
									<Input
										type={showPassword ? "text" : "password"}
										placeholder="••••••••"
										value={password}
										onChange={(e) => setPassword(e.target.value)}
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

							<Button
								type="submit"
								className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-10 font-semibold rounded-lg"
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
