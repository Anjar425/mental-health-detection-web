"use client"

import Link from "next/link"
import { Shield } from "lucide-react"

interface HeaderProps {
  title?: string
  subtitle?: string
  showLogo?: boolean
}

export function Header({ title = "MindCare", subtitle, showLogo = true }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex-1">
          {showLogo && (
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-linear-to-br from-primary to-secondary flex items-center justify-center">
                <span className="text-white text-sm font-bold">MC</span>
              </div>
              <Link href="/" className="text-xl font-bold text-foreground hover:opacity-80 transition-opacity">
                {title}
              </Link>
            </div>
          )}
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>

        <Link
          href="/auth/login"
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-medium"
        >
          <Shield className="w-4 h-4" />
          <span className="hidden sm:inline">Login</span>
        </Link>
      </div>
    </header>
  )
}
