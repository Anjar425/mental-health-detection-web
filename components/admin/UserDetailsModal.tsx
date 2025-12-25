"use client"

import React, { useEffect, useRef } from "react"

interface Props {
  open: boolean
  onClose: () => void
  user?: { id: string; username: string; email: string; role: string }
}

export default function UserDetailsModal({ open, onClose, user }: Props) {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    if (open) {
      document.addEventListener("keydown", onKey)
      setTimeout(() => ref.current?.focus(), 50)
    }
    return () => document.removeEventListener("keydown", onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity animate-in fade-in" 
        onClick={onClose} 
      />

      {/* Modal Content */}
      <div 
        ref={ref} 
        tabIndex={-1} 
        className="relative z-50 w-full max-w-md bg-card text-card-foreground p-6 rounded-lg border border-border shadow-lg animate-in fade-in-0 zoom-in-95 duration-200"
      >
        <div className="flex flex-col space-y-1.5 mb-4">
          <h3 className="text-lg font-semibold leading-none tracking-tight">
            User Details
          </h3>
          <p className="text-sm text-muted-foreground">
            Informasi lengkap pengguna yang dipilih.
          </p>
        </div>

        {user ? (
          <div className="grid gap-4 py-2">
            {/* Grid Layout untuk Label & Value */}
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-sm font-medium text-muted-foreground text-right">
                ID
              </span>
              <span className="col-span-3 text-sm font-mono truncate">
                {user.id}
              </span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-sm font-medium text-muted-foreground text-right">
                Username
              </span>
              <span className="col-span-3 text-sm font-medium">
                {user.username}
              </span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-sm font-medium text-muted-foreground text-right">
                Email
              </span>
              <span className="col-span-3 text-sm">
                {user.email}
              </span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-sm font-medium text-muted-foreground text-right">
                Role
              </span>
              <span className="col-span-3 text-sm">
                <span className="inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-foreground">
                  {user.role}
                </span>
              </span>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center text-sm text-muted-foreground italic">
            No user selected.
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button 
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2" 
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}