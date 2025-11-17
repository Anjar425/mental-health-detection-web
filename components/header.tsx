"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import Link from "next/link"
import { Shield } from "lucide-react"
import { jwtDecode } from "jwt-decode"

interface HeaderProps {
	title?: string
	subtitle?: string
	showLogo?: boolean
}

interface JWTPayload {
	exp?: number
	role?: string
	name?: string
	avatar_url?: string
}

interface AuthUser {
	name?: string
	avatar_url?: string
	role?: string
}

export function Header({ title = "MindCare", subtitle, showLogo = true }: HeaderProps) {
	const [isLoggedIn, setIsLoggedIn] = useState(false)
	const [user, setUser] = useState<AuthUser | null>(null)

	useEffect(() => {
		const token = sessionStorage.getItem("authToken")
		if (!token) return setIsLoggedIn(false)

		try {
			const decoded = jwtDecode<JWTPayload>(token)

			if (!decoded.exp) {
				setIsLoggedIn(false)
				sessionStorage.removeItem("authToken")
				return
			}

			const now = Math.floor(Date.now() / 1000)
			if (decoded.exp < now) {
				setIsLoggedIn(false)
				sessionStorage.removeItem("authToken")
				return
			}

			setUser({
				name: decoded.name || "User",
				avatar_url: decoded.avatar_url || "",
				role: decoded.role || "user"
			})

			setIsLoggedIn(true)
		} catch (err) {
			console.error("Invalid token:", err)
			setIsLoggedIn(false)
			sessionStorage.removeItem("authToken")
		}
	}, [])

	// Tentukan dashboard tujuan berdasarkan role
	const dashboardUrl =
		user?.role === "expert" ? "/expert/dashboard" : "/user/dashboard"

	return (
		<header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur-sm">
			<div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">

				{/* Logo */}
				<div className="flex-1">
					{showLogo && (
						<div className="flex items-center gap-2 mb-2">
							<div className="w-8 h-8 rounded-lg bg-linear-to-br from-primary to-secondary flex items-center justify-center">
								<span className="text-white text-sm font-bold">MC</span>
							</div>
							<Link href="/" className="text-xl font-bold text-foreground hover:opacity-80 transition-opacity">
								{title}
							</Link>
						</div>
					)}
					{subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
				</div>

				{/* Right section */}
				{!isLoggedIn ? (
					/* Jika belum login */
					<Link
						href="/auth/login"
						className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-medium"
					>
						<div className="h-8 flex flex-row justify-center items-center gap-2">
							<Shield className="w-4 h-4" />
							<span className="hidden sm:inline">Login</span>
						</div>
					</Link>
				) : (
					/* Jika sudah login */
					<Link
						href={dashboardUrl}
						className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-sm font-medium"
					>
						<Avatar className="h-8 w-8">
							<AvatarImage
								src={user?.avatar_url || "/default-avatar.png"}
								alt={user?.name || "User"}
							/>
							<AvatarFallback>
								{user?.name ? user.name.charAt(0).toUpperCase() : "U"}
							</AvatarFallback>
						</Avatar>

						<span className="text-sm font-medium text-foreground hidden sm:inline">
							{user?.name || "User"}
						</span>
					</Link>
				)}
			</div>
		</header>
	)
}
