"use client"

import React from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"

export function AdminNav() {
  const router = useRouter()
  const pathname = usePathname()

  function handleLogout() {
    // Clear auth token and redirect to login
    sessionStorage.removeItem("authToken")
    router.push("/auth/login")
  }

  // Helper untuk styling link aktif vs tidak aktif
  const getLinkClass = (path: string) => {
    // Cek apakah path saat ini sama dengan link
    // Gunakan exact match untuk root '/admin', dan startsWith untuk sub-menu
    const isActive = path === "/admin" 
      ? pathname === "/admin"
      : pathname?.startsWith(path)

    return `text-sm font-medium transition-colors hover:text-primary ${
      isActive ? "text-foreground" : "text-muted-foreground"
    }`
  }

  return (
    <nav className="flex items-center justify-between mb-8 pb-4 border-b border-border">
      <div className="flex items-center gap-6">
        <Link href="/admin" className={getLinkClass("/admin")}>
          Overview
        </Link>
        <Link href="/admin/users" className={getLinkClass("/admin/users")}>
          Users
        </Link>
        <Link href="/admin/experts" className={getLinkClass("/admin/experts")}>
          Experts
        </Link>
        <Link href="/admin/rankings" className={getLinkClass("/admin/rankings")}>
          Rankings & Consensus
        </Link>
      </div>

      <div className="flex items-center gap-3">
        {/* <button
          className="text-sm font-medium px-3 py-1.5 border border-border rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => {
            navigator.clipboard.writeText(window.location.href)
            // Opsional: Tambahkan toast notification di sini
          }}
        >
          Copy link
        </button> */}
        <button
          className="text-sm font-medium px-3 py-1.5 border border-border rounded-md text-destructive hover:bg-destructive/10 hover:border-destructive/30 transition-colors"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </nav>
  )
}