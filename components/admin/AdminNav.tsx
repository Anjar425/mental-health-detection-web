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

    return `text-sm font-medium transition-colors hover:text-primary whitespace-nowrap ${
      isActive ? "text-foreground" : "text-muted-foreground"
    }`
  }

  return (
    <nav className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-8 pb-4 border-b border-border gap-3">
      {/* Navigation Links - Scrollable on mobile */}
      <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex items-center gap-4 sm:gap-6 min-w-max">
          <Link href="/admin" className={getLinkClass("/admin")}>
            Overview
          </Link>
          <Link href="/admin/users" className={getLinkClass("/admin/users")}>
            Users
          </Link>
          <Link href="/admin/experts" className={getLinkClass("/admin/experts")}>
            Experts
          </Link>
          <Link href="/admin/groups" className={getLinkClass("/admin/groups")}> 
            Groups
          </Link>
          <Link href="/admin/rankings" className={getLinkClass("/admin/rankings")}> 
            Rankings
          </Link>
          <Link href="/admin/conflict" className={getLinkClass("/admin/conflict")}> 
            Conflicts
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-3 self-end sm:self-auto">
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
