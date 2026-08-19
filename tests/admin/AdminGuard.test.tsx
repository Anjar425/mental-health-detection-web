import React from "react"
import { render, screen } from "@testing-library/react"
import { vi } from "vitest"

vi.mock("jwt-decode", () => {
  return {
    jwtDecode: (token: string) => ({ role: token === "admin-token" ? "admin" : "user" }),
  }
})

import AdminGuard from "../../components/admin/AdminGuard"

function Wrapper({ token }: { token: string | null }) {
  if (token) sessionStorage.setItem("authToken", token)
  else sessionStorage.removeItem("authToken")
  return (
    <AdminGuard>
      <div>Secret admin area</div>
    </AdminGuard>
  )
}

describe("AdminGuard", () => {
  it("shows 403 for non-admin", async () => {
    render(<Wrapper token={"user-token"} />)
    expect(await screen.findByText(/403/i)).toBeInTheDocument()
  })

  it("allows admin users", async () => {
    render(<Wrapper token={"admin-token"} />)
    expect(await screen.findByText(/Secret admin area/)).toBeInTheDocument()
  })
})
