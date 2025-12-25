import React from "react"
import { render, screen } from "@testing-library/react"
import UserDetailsModal from "../../components/admin/UserDetailsModal"

describe("UserDetailsModal", () => {
  it("renders user details when open", () => {
    render(
      <UserDetailsModal
        open={true}
        onClose={() => {}}
        user={{ id: "1", username: "alice", email: "a@example.com", role: "user" }}
      />,
    )

    expect(screen.getByText(/User details/)).toBeInTheDocument()
    expect(screen.getByText(/alice/)).toBeInTheDocument()
  })
})
