"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Menu, X, Monitor } from "lucide-react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

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

  const navLinks = [
    { href: "/admin", label: "Overview" },
    { href: "/admin/users", label: "Users" },
    { href: "/admin/experts", label: "Experts" },
    { href: "/admin/groups", label: "Groups" },
    { href: "/admin/rankings", label: "Rankings & Consensus" },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* --- MOBILE HEADER --- */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <h3 className="text-lg font-bold tracking-tight">Admin Panel</h3>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-md hover:bg-muted transition-colors"
            aria-label="Toggle menu"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* --- MOBILE SIDEBAR OVERLAY --- */}
      {sidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* --- SIDEBAR --- */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        w-64 min-h-screen border-r border-sidebar-border bg-sidebar text-sidebar-foreground flex-col
        transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:flex
      `}>
        
        {/* Sidebar Header */}
        <div className="p-6 border-b border-sidebar-border/50">
          <h3 className="text-lg font-bold tracking-tight text-sidebar-foreground">
            Admin Panel
          </h3>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navLinks.map((link) => (
            <Link 
              key={link.href}
              href={link.href} 
              className={getLinkClass(link.href)}
              onClick={() => setSidebarOpen(false)}
            >
              {link.label}
            </Link>
          ))}
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
        {/* Mobile Header Spacer */}
        <div className="h-14 md:hidden" />
        
        <div className="flex-1 p-4 sm:p-6 md:p-8 overflow-auto">
          {/* Breadcrumb / Page Title Area */}
          <div className="mb-4 sm:mb-6">
            <nav className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Admin / {pathname === "/admin" ? "Overview" : pathname?.split("/").pop()}
            </nav>
          </div>

          <section className="animate-in fade-in duration-500">
            {children}
          </section>
        </div>
      </main>
    </div>
  )
}