"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { jwtDecode } from "jwt-decode"

interface JWTPayload {
  sub?: string
  role?: string
  exp?: number
}

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [allowed, setAllowed] = useState<boolean | null>(null)

  useEffect(() => {
    const token = sessionStorage.getItem("authToken")
    if (!token) {
      setAllowed(false)
      // redirect to login
      router.push("/auth/login")
      return
    }
    try {
      const payload = jwtDecode<JWTPayload>(token)
      if (payload.role === "admin") setAllowed(true)
      else setAllowed(false)
    } catch (err) {
      console.error("Invalid token", err)
      sessionStorage.removeItem("authToken")
      setAllowed(false)
      router.push("/")
    }
  }, [router])

  if (allowed === null) return <div className="p-6">Checking access...</div>

  if (allowed === false)
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold">403 — Forbidden</h2>
        <p className="mt-2 text-muted-foreground">Anda tidak memiliki izin untuk mengakses halaman admin.</p>
        <div className="mt-4">
          <button
            className="px-3 py-1 rounded border"
            onClick={() => {
              sessionStorage.removeItem("authToken")
              router.push("/")
            }}
          >
            Kembali ke beranda
          </button>
        </div>
      </div>
    )

  return <>{children}</>
}
