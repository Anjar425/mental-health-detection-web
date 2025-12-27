"use client"

import React from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()

  function handleLogout() {
    sessionStorage.removeItem("authToken")
    router.push("/auth/login")
  }

  // Helper untuk menentukan style link (Aktif vs Tidak Aktif)
  const getLinkClass = (path: string) => {
    // Logic: Jika path persis sama, atau jika path sub-halaman (kecuali root /admin)
    const isActive = path === "/admin" 
      ? pathname === "/admin"
      : pathname?.startsWith(path)

    return `block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? "bg-sidebar-accent text-sidebar-accent-foreground"
        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
    }`
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* --- SIDEBAR --- */}
      {/* Menggunakan variabel --sidebar-* dari globals.css */}
      <aside className="w-64 min-h-screen border-r border-sidebar-border bg-sidebar text-sidebar-foreground flex-col hidden md:flex">
        
        {/* Sidebar Header */}
        <div className="p-6 border-b border-sidebar-border/50">
          <h3 className="text-lg font-bold tracking-tight text-sidebar-foreground">
            Admin Panel
          </h3>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 p-4 space-y-1">
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
            Rankings & Consensus
          </Link>
        </nav>

        {/* Sidebar Footer (Logout) */}
        <div className="p-4 border-t border-sidebar-border/50">
          <button
            onClick={handleLogout}
            className="w-full px-3 py-2 rounded-md text-sm font-medium border border-sidebar-border bg-sidebar-accent/20 text-destructive hover:bg-destructive/10 hover:border-destructive/30 transition-all shadow-sm"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 flex flex-col min-w-0 bg-background">
        {/* Mobile Header could go here if needed */}
        
        <div className="flex-1 p-6 md:p-8 overflow-auto">
          {/* Breadcrumb / Page Title Area */}
          <div className="mb-6">
            <nav className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Admin / {pathname === "/admin" ? "Overview" : pathname?.split("/").pop()}
            </nav>
            {/* Header Content dinamis bisa ditaruh di sini atau di page masing-masing */}
          </div>

          <section className="animate-in fade-in duration-500">
            {children}
          </section>
        </div>
      </main>
    </div>
  )
}