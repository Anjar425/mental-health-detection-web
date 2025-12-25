import React from "react"
import { render, screen, waitFor, fireEvent } from "@testing-library/react"
import { vi } from "vitest"
import UsersPage from "../../app/admin/users/page"

// mock services
vi.mock("../../services/admin", () => ({
  getUsers: vi.fn(() =>
    Promise.resolve(
      Array.from({ length: 25 }).map((_, i) => ({ id: String(i + 1), username: `user${i + 1}`, email: `u${i + 1}@x.com`, role: i % 3 === 0 ? "admin" : "user" })),
    ),
  ),
}))

describe("UsersPage", () => {
  it("renders users list", async () => {
    render(<UsersPage />)
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument()
    await waitFor(() => expect(screen.getByText("user1")).toBeInTheDocument())
  })

  it("copies all emails", async () => {
    const clipboardWrite = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue()
    render(<UsersPage />)
    await waitFor(() => expect(screen.getByText("user1")).toBeInTheDocument())
    fireEvent.click(screen.getByText(/Copy all emails/i))
    await waitFor(() => expect(clipboardWrite).toHaveBeenCalled())
    clipboardWrite.mockRestore()
  })

  it("paginates results", async () => {
    render(<UsersPage />)
    await waitFor(() => expect(screen.getByText("user1")).toBeInTheDocument())
    // page 1 contains user1..10
    expect(screen.queryByText("user11")).not.toBeInTheDocument()
    fireEvent.click(screen.getByText(/Next/))
    await waitFor(() => expect(screen.getByText("user11")).toBeInTheDocument())
  })
})
