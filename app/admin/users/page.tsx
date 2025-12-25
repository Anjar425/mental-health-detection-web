"use client"

import React, { useEffect, useMemo, useState } from "react"
import { AdminNav } from "../../../components/admin/AdminNav"
import UserDetailsModal from "../../../components/admin/UserDetailsModal"
import { getUsers } from "../../../services/admin"

interface User {
  id: string 
  username: string
  email: string
  role: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState("")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  // 1. Fetch Data
  useEffect(() => {
    let mounted = true
    setLoading(true)

    getUsers({ page: 1, perPage: 100 })
      .then((data) => {
        if (mounted) {
          const safeItems = (data.items || []).map((u: any) => ({
            ...u,
            id: String(u.id), 
          }))
          setUsers(safeItems)
        }
      })
      .catch((err) => {
        console.error("Failed to fetch users:", err)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [])

  // 2. Sorting State
  const [sortKey, setSortKey] = useState<null | keyof User>(null)
  const [sortDir, setSortDir] = useState<1 | -1>(1)

  // 3. Pagination State
  const [page, setPage] = useState(1)
  const perPage = 10

  // 4. Filtering & Sorting Logic
  const filtered = useMemo(() => {
    if (!Array.isArray(users)) return []

    // Filter khusus role 'user'
    const onlyOrdinaryUsers = users.filter(u => u.role === "user")

    const q = query.toLowerCase()
    const base = query
      ? onlyOrdinaryUsers.filter(
          (u) =>
            (u.username && u.username.toLowerCase().includes(q)) ||
            (u.email && u.email.toLowerCase().includes(q))
        )
      : onlyOrdinaryUsers

    if (!sortKey) return base

    return [...base].sort((a, b) => {
      const av = String(a[sortKey] ?? "").toLowerCase()
      const bv = String(b[sortKey] ?? "").toLowerCase()
      if (av === bv) return 0
      return av > bv ? sortDir : -sortDir
    })
  }, [users, query, sortKey, sortDir])

  useEffect(() => {
    setPage(1)
  }, [query, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const visible = filtered.slice((page - 1) * perPage, page * perPage)

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <AdminNav />

      <main className="flex-1 container mx-auto p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Registered Users</h2>
            <p className="text-sm text-muted-foreground">Manage regular user accounts.</p>
          </div>
          
          <div className="flex items-center gap-2">
            <input
              className="flex h-9 w-full sm:w-64 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Search users..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
              onClick={() => {
                const emails = filtered.map((u) => u.email).join(",")
                navigator.clipboard.writeText(emails)
                alert("All displayed emails copied!")
              }}
            >
              Copy emails
            </button>
          </div>
        </div>

        <div className="rounded-md border border-border bg-card text-card-foreground shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground animate-pulse">Loading users...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground italic">No regular users found.</div>
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
                      <th className="p-4">Role</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {visible.map((u) => (
                      <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-4 font-mono text-muted-foreground">{u.id}</td>
                        <td className="p-4 font-medium text-foreground">{u.username}</td>
                        <td className="p-4 text-muted-foreground">{u.email}</td>
                        <td className="p-4">
                          <span className="inline-flex items-center rounded-full border border-transparent bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground hover:bg-secondary/80">
                            {u.role}
                          </span>
                        </td>
                        <td className="p-4 text-right flex justify-end gap-3">
                          <button
                            className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
                            onClick={() => {
                              setSelectedUser(u)
                              setModalOpen(true)
                            }}
                          >
                            Details
                          </button>
                          <button 
                              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                              onClick={() => {
                                  navigator.clipboard.writeText(u.email)
                                  alert("Copied!")
                              }}
                          >
                              Copy
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
                      <span className="inline-flex items-center rounded-full border border-transparent bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
                        {u.role}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{u.username}</div>
                      <div className="text-sm text-muted-foreground">{u.email}</div>
                    </div>
                    <div className="pt-2 flex gap-4 border-t border-border mt-2">
                      <button
                          className="text-primary hover:text-primary/80 text-sm font-medium"
                          onClick={() => {
                            setSelectedUser(u)
                            setModalOpen(true)
                          }}
                        >
                          View Details
                      </button>
                      <button
                          className="text-muted-foreground hover:text-foreground text-sm"
                          onClick={() => navigator.clipboard.writeText(u.email)}
                        >
                          Copy Email
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              <div className="p-4 border-t border-border flex items-center justify-between bg-muted/20">
                <div className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <button 
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-8 px-3" 
                    onClick={() => setPage((p) => Math.max(1, p - 1))} 
                    disabled={page === 1}
                  >
                    Prev
                  </button>
                  <button 
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-8 px-3" 
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