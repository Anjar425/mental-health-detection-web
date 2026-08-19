import { test, expect } from "@playwright/test"

const adminPayload = "eyJyb2xlIjoiYWRtaW4iLCJzdWIiOiJhZG1pbkBleGFtcGxlLmNvbSJ9" // {role: 'admin', sub: 'admin@example.com'}
const userPayload = "eyJyb2xlIjoidXNlciIsInN1YiI6InVzZXJAZXhhbXBsZS5jb20ifQ" // {role: 'user', sub: 'user@example.com'}

test.describe("Admin access", () => {
  test("admin can access /admin/users", async ({ page, baseURL }) => {
    await page.goto(baseURL || "/")
    await page.evaluate((token) => sessionStorage.setItem("authToken", `h.${token}.s`), adminPayload)
    await page.goto((baseURL || "") + "/admin/users")
    await expect(page.locator("h2", { hasText: "Users" })).toBeVisible()
  })

  test("non-admin gets 403", async ({ page, baseURL }) => {
    await page.goto(baseURL || "/")
    await page.evaluate((token) => sessionStorage.setItem("authToken", `h.${token}.s`), userPayload)
    await page.goto((baseURL || "") + "/admin/users")
    await expect(page.locator("text=403")).toBeVisible()
    await expect(page.locator("text=Anda tidak memiliki izin")).toBeVisible()
  })
})
