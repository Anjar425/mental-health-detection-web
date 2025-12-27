"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { AdminNav } from "../../components/admin/AdminNav"
import StatsCard from "../../components/admin/StatsCard"
import { getUsers } from "../../services/admin"

type Stats = {
  totalUsers: number;
  experts: number;
  admins: number;
}

export default function AdminHomePage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        // Ambil maksimal 100 user (batas dari backend)
        const response = await getUsers({ page: 1, perPage: 100 })
        const allAccounts = response.items || []

        const regularUsersCount = allAccounts.filter((u) => u.role === "user").length
        const expertsCount = allAccounts.filter((u) => u.role === "expert").length
        const adminsCount = allAccounts.filter((u) => u.role === "admin").length

        setStats({
          totalUsers: regularUsersCount,
          experts: expertsCount,
          admins: adminsCount,
        })
      } catch (err) {
        console.error("Gagal memuat statistik:", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <AdminNav />

      <main className="flex-1 container mx-auto p-6 space-y-8">
        
        {/* Header */}
        <header className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-muted-foreground text-sm">
            Selamat datang kembali, Admin. Berikut ringkasan data sistem hari ini.
          </p>
        </header>

        {/* Stats Section */}
        <section className="grid md:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
          <StatsCard 
            title="Total Users" 
            value={loading ? "..." : stats?.totalUsers ?? "-"} 
          />
          <StatsCard 
            title="Experts" 
            value={loading ? "..." : stats?.experts ?? "-"} 
          />
          <StatsCard 
            title="Admins" 
            value={loading ? "..." : stats?.admins ?? "-"} 
          />
        </section>

        {/* Quick Links Section */}
        <section className="space-y-4 animate-in slide-in-from-bottom-6 duration-700 delay-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight">Quick Actions</h2>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
                        {/* Manage Groups Card */}
                        <Link 
                          href="/admin/groups" 
                          className="p-6 border border-border bg-card rounded-xl hover:bg-accent/50 hover:border-primary/30 transition-all duration-200 shadow-sm group"
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-green-100 rounded-lg text-green-700 group-hover:bg-green-600 group-hover:text-white transition-colors">
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><path d="M22 19v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                            </div>
                            <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors">Manage Groups</h3>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Buat, edit, dan kelola grup pakar untuk kolaborasi dan analisis.
                          </p>
                        </Link>
            {/* Manage Users Card */}
            <Link 
              href="/admin/users" 
              className="p-6 border border-border bg-card rounded-xl hover:bg-accent/50 hover:border-primary/30 transition-all duration-200 shadow-sm group"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </div>
                <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors">Manage Users</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Lihat daftar pengguna, edit role, atau kelola akun user biasa.
              </p>
            </Link>
            
            {/* Manage Experts Card */}
            <Link 
              href="/admin/experts" 
              className="p-6 border border-border bg-card rounded-xl hover:bg-accent/50 hover:border-primary/30 transition-all duration-200 shadow-sm group"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-secondary/10 rounded-lg text-secondary-foreground group-hover:bg-secondary group-hover:text-white transition-colors">
                   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 21a8 8 0 0 1 13.292-6"/><circle cx="10" cy="8" r="5"/><path d="m19 16 3 3"/><path d="m22 16-3 3"/></svg>
                </div>
                <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors">Manage Experts</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Verifikasi profil ahli, lihat detail kapabilitas, dan manajemen akun pakar.
              </p>
            </Link>

            {/* Expert Rankings Card */}
            <Link 
              href="/admin/rankings" 
              className="p-6 border border-border bg-card rounded-xl hover:bg-accent/50 hover:border-primary/30 transition-all duration-200 shadow-sm group"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-destructive/10 rounded-lg text-destructive group-hover:bg-destructive group-hover:text-white transition-colors">
                   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
                </div>
                <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors">Expert Rankings (DSS)</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Lihat hasil optimasi bobot pakar (GA) dan matriks konsensus (Fuzzy IOWA).
              </p>
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}