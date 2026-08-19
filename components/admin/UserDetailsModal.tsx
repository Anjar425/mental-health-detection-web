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
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
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
        className="relative z-50 w-full max-w-md bg-card text-card-foreground p-4 sm:p-6 rounded-lg border border-border shadow-lg animate-in fade-in-0 zoom-in-95 duration-200 max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
      >
        <div className="flex flex-col space-y-1 sm:space-y-1.5 mb-3 sm:mb-4">
          <h3 className="text-base sm:text-lg font-semibold leading-none tracking-tight">
            User Details
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Informasi lengkap pengguna yang dipilih.
          </p>
        </div>

        {user ? (
          <div className="grid gap-3 sm:gap-4 py-2">
            {/* Grid Layout untuk Label & Value */}
            <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-1 sm:gap-4">
              <span className="text-xs sm:text-sm font-medium text-muted-foreground sm:text-right">
                ID
              </span>
              <span className="col-span-1 sm:col-span-3 text-xs sm:text-sm font-mono truncate">
                {user.id}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-1 sm:gap-4">
              <span className="text-xs sm:text-sm font-medium text-muted-foreground sm:text-right">
                Username
              </span>
              <span className="col-span-1 sm:col-span-3 text-xs sm:text-sm font-medium">
                {user.username}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-1 sm:gap-4">
              <span className="text-xs sm:text-sm font-medium text-muted-foreground sm:text-right">
                Email
              </span>
              <span className="col-span-1 sm:col-span-3 text-xs sm:text-sm break-all">
                {user.email}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-1 sm:gap-4">
              <span className="text-xs sm:text-sm font-medium text-muted-foreground sm:text-right">
                Role
              </span>
              <span className="col-span-1 sm:col-span-3 text-xs sm:text-sm">
                <span className="inline-flex items-center rounded-full border border-border px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-foreground">
                  {user.role}
                </span>
              </span>
            </div>
          </div>
        ) : (
          <div className="py-4 sm:py-6 text-center text-xs sm:text-sm text-muted-foreground italic">
            No user selected.
          </div>
        )}

        <div className="mt-4 sm:mt-6 flex justify-end">
          <button 
            className="inline-flex items-center justify-center rounded-md text-xs sm:text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground h-8 sm:h-9 px-3 sm:px-4 py-2" 
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}