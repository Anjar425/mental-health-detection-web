"use client"

import React, { useEffect, useMemo, useState } from "react"
import { AdminNav } from "../../../components/admin/AdminNav"
import UserDetailsModal from "../../../components/admin/UserDetailsModal"
import { getExperts } from "../../../services/admin"

interface User {
  id: string
  username: string
  email: string
  role: string
}

export default function ExpertsPage() {
  const [experts, setExperts] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  // ---------------- FETCH DATA ----------------
  useEffect(() => {
    let active = true
    setLoading(true)

    getExperts({ page: 1, perPage: 100 })
      .then((res: any) => {
        // console.log("Experts API response:", res) // Optional debug

        if (!active) return

        let items: any[] = []

        // CASE 1: backend return array
        if (Array.isArray(res)) {
          items = res
        }
        // CASE 2: backend return paginated object
        else if (Array.isArray(res?.items)) {
          items = res.items
        }

        const safeItems: User[] = items.map((u) => ({
          id: String(u.id),
          username: u.username ?? "-",
          email: u.email ?? "-",
          role: u.role ?? "expert",
        }))

        setExperts(safeItems)
      })
      .catch((err) => {
        console.error("Failed to fetch experts:", err)
        setExperts([])
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  // ---------------- SORT & FILTER ----------------
  const [sortKey, setSortKey] = useState<keyof User | null>(null)
  const [sortDir, setSortDir] = useState<1 | -1>(1)

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    let data = experts

    if (q) {
      data = data.filter(
        (u) =>
          u.username.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q)
      )
    }

    if (!sortKey) return data

    return [...data].sort((a, b) => {
      const av = String(a[sortKey] ?? "").toLowerCase()
      const bv = String(b[sortKey] ?? "").toLowerCase()
      if (av === bv) return 0
      return av > bv ? sortDir : -sortDir
    })
  }, [experts, query, sortKey, sortDir])

  // ---------------- PAGINATION ----------------
  const [page, setPage] = useState(1)
  const perPage = 10
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const visible = filtered.slice((page - 1) * perPage, page * perPage)

  useEffect(() => {
    setPage(1)
  }, [query, sortKey, sortDir])

  // ---------------- UI ----------------
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <AdminNav />

      <main className="flex-1 container mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Experts Management</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">Manage and monitor expert accounts.</p>
          </div>
          
          <input
            className="flex h-9 w-full sm:w-64 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Search experts..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="rounded-md border border-border bg-card text-card-foreground shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground animate-pulse">Loading experts...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground italic">No experts found.</div>
          ) : (
            <>
              {/* Desktop View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
                    <tr>
                      <th 
                        className="p-4 cursor-pointer hover:text-foreground transition-colors"
                        onClick={() => { setSortKey("id"); setSortDir(sortKey === "id" ? (-sortDir as 1 | -1) : 1) }}
                      >
                        ID {sortKey === "id" && (sortDir === 1 ? "↑" : "↓")}
                      </th>
                      <th 
                        className="p-4 cursor-pointer hover:text-foreground transition-colors"
                        onClick={() => { setSortKey("username"); setSortDir(sortKey === "username" ? (-sortDir as 1 | -1) : 1) }}
                      >
                        Username {sortKey === "username" && (sortDir === 1 ? "↑" : "↓")}
                      </th>
                      <th 
                        className="p-4 cursor-pointer hover:text-foreground transition-colors"
                        onClick={() => { setSortKey("email"); setSortDir(sortKey === "email" ? (-sortDir as 1 | -1) : 1) }}
                      >
                        Email {sortKey === "email" && (sortDir === 1 ? "↑" : "↓")}
                      </th>
                      <th className="p-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {visible.map((u) => (
                      <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-4 font-mono text-muted-foreground">{u.id}</td>
                        <td className="p-4 font-medium text-foreground">{u.username}</td>
                        <td className="p-4 text-muted-foreground">{u.email}</td>
                        <td className="p-4 text-right">
                          <button
                            className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
                            onClick={() => {
                              setSelectedUser(u)
                              setModalOpen(true)
                            }}
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile View */}
              <div className="md:hidden divide-y divide-border">
                {visible.map((u) => (
                  <div key={u.id} className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-mono text-muted-foreground">#{u.id}</span>
                      <span className="inline-flex items-center rounded-full border border-transparent bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                        Expert
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{u.username}</div>
                      <div className="text-sm text-muted-foreground">{u.email}</div>
                    </div>
                    <div className="pt-2 flex justify-end border-t border-border mt-2">
                      <button
                        className="text-primary hover:text-primary/80 text-sm font-medium"
                        onClick={() => {
                          setSelectedUser(u)
                          setModalOpen(true)
                        }}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              <div className="p-3 sm:p-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 bg-muted/20">
                <div className="text-xs sm:text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button 
                    className="inline-flex items-center justify-center rounded-md text-xs sm:text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-8 px-3 flex-1 sm:flex-none" 
                    onClick={() => setPage((p) => Math.max(1, p - 1))} 
                    disabled={page === 1}
                  >
                    Prev
                  </button>
                  <button 
                    className="inline-flex items-center justify-center rounded-md text-xs sm:text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-8 px-3 flex-1 sm:flex-none" 
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))} 
                    disabled={page === totalPages}
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <UserDetailsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        user={selectedUser ?? undefined}
      />
    </div>
  )
}