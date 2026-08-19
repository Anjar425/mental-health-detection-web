"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import Link from "next/link"
import { Shield } from "lucide-react"
import { useRouter } from "next/navigation"
import { isTokenExpired, getRoleFromToken, clearAuth } from "@/lib/auth"

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
			if (isTokenExpired(token)) {
				// get role if present for contextual message
				const role = getRoleFromToken(token) || "user"
				clearAuth()
				setIsLoggedIn(false)
				// redirect to logged-out page with reason
				router.replace(`/auth/logged-out?role=${encodeURIComponent(role)}&reason=expired`)
				return
			}

			const role = getRoleFromToken(token) || "user"
			setUser({
				name: undefined,
				avatar_url: undefined,
				role: role,
			})
			setIsLoggedIn(true)
		} catch (err) {
			console.error("Invalid token:", err)
			clearAuth()
			setIsLoggedIn(false)
		}
	}, [])

	// Tentukan dashboard tujuan berdasarkan role
	const dashboardUrl =
		user?.role === "expert" ? "/expert/dashboard" : "/user/dashboard"

	return (
		<header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur-sm">
			<div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between">

				{/* Logo */}
				<div className="flex-1 min-w-0">
					{showLogo && (
						<div className="flex items-center gap-2 mb-1 sm:mb-2">
							<div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-linear-to-br from-primary to-secondary flex items-center justify-center shrink-0">
								<span className="text-white text-xs sm:text-sm font-bold">MC</span>
							</div>
							<Link href="/" className="text-base sm:text-xl font-bold text-foreground hover:opacity-80 transition-opacity truncate">
								{title}
							</Link>
						</div>
					)}
					{subtitle && <p className="text-xs sm:text-sm text-muted-foreground truncate">{subtitle}</p>}
				</div>

				{/* Right section */}
				{!isLoggedIn ? (
					/* Jika belum login */
					<Link
						href="/auth/login"
						className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-xs sm:text-sm font-medium shrink-0"
					>
						<div className="h-6 sm:h-8 flex flex-row justify-center items-center gap-1 sm:gap-2">
							<Shield className="w-3 h-3 sm:w-4 sm:h-4" />
							<span className="hidden sm:inline">Login</span>
						</div>
					</Link>
				) : (
					/* Jika sudah login */
					<Link
						href={dashboardUrl}
						className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg hover:bg-accent transition-colors text-xs sm:text-sm font-medium shrink-0"
					>
						<Avatar className="h-6 w-6 sm:h-8 sm:w-8">
							<AvatarImage
								src={user?.avatar_url || "/default-avatar.png"}
								alt={user?.name || "User"}
							/>
							<AvatarFallback>
								{user?.name ? user.name.charAt(0).toUpperCase() : "U"}
							</AvatarFallback>
						</Avatar>

						<span className="text-xs sm:text-sm font-medium text-foreground hidden sm:inline">
							{user?.name || "User"}
						</span>
					</Link>
				)}
			</div>
		</header>
	)
}
