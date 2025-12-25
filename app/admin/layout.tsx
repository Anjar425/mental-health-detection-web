import React from "react"

import AdminLayout from "../../components/admin/AdminLayout"
import AdminGuard from "../../components/admin/AdminGuard"

export const metadata = {
  title: "Admin - MindCare",
}

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <AdminLayout>{children}</AdminLayout>
    </AdminGuard>
  )
}
