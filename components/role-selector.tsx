"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User, Lock } from "lucide-react"

type UserRole = "guest" | "user"

interface RoleSelectorProps {
  onRoleSelect?: (role: UserRole) => void
}

interface RoleOption {
  id: UserRole
  label: string
  description: string
  icon: React.ReactNode
  color: string
}

const roles: RoleOption[] = [
  {
    id: "guest",
    label: "Tamu",
    description: "Coba deteksi kesehatan mental tanpa membuat akun",
    icon: <User className="w-5 h-5" />,
    color: "text-blue-500",
  },
  {
    id: "user",
    label: "Pengguna",
    description: "Buat akun untuk menyimpan riwayat dan analisis",
    icon: <Lock className="w-5 h-5" />,
    color: "text-green-500",
  },
]

export function RoleSelector({ onRoleSelect }: RoleSelectorProps) {
  const [selected, setSelected] = useState<UserRole | null>(null)

  const handleSelect = (role: UserRole) => {
    setSelected(role)
    onRoleSelect?.(role)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h3 className="text-2xl font-bold text-foreground mb-2 text-center">Pilih Peran Anda</h3>
        <p className="text-center text-muted-foreground text-sm">Setiap peran memiliki akses ke fitur yang berbeda</p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        {roles.map((role) => (
          <Card
            key={role.id}
            className={`cursor-pointer transition-all duration-300 border-2 ${
              selected === role.id
                ? "border-primary bg-primary/5 shadow-lg"
                : "border-border/50 hover:border-primary/50 hover:shadow-md"
            }`}
            onClick={() => handleSelect(role.id)}
          >
            <CardHeader className="pb-3">
              <div className={`${role.color} mb-3`}>{role.icon}</div>
              <h4 className="font-semibold text-foreground">{role.label}</h4>
              <CardDescription className="text-xs text-muted-foreground">{role.description}</CardDescription>
            </CardHeader>
            <CardContent>
              {selected === role.id && (
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-8 text-xs font-medium rounded-full">
                  Dipilih
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
