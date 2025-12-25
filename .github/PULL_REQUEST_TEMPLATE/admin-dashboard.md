feat(admin): Add Admin Dashboard feature

Summary:
- Add `app/admin` routes: `/admin`, `/admin/users`, `/admin/experts`
- `AdminLayout`, `AdminNav`, `AdminGuard` for protected admin area
- `services/admin.ts` typed API service for admin endpoints
- `UserDetailsModal`, `ConfirmDialog`, `StatsCard` and users CRUD UI (with TODOs for backend actions)
- Search, column sorting, pagination, CSV export, copy all emails, responsive table/cards
- Unit tests (Vitest + Testing Library) and Playwright e2e tests added
- Documentation added in `docs/admin-dashboard.md`

Testing / QA steps:
1. Start the app: `pnpm dev`
2. Login as admin at `/auth/login` (admin@example.com / admin123)
3. Visit `/admin` and confirm stats and quick links render
4. Visit `/admin/users` and:
   - Search users
   - Sort by column headers
   - Use Prev/Next pagination
   - Click `View` to open user details modal
   - Click `Copy all emails` and confirm clipboard content
   - Click `Export CSV` and confirm a file is downloaded
5. Login as non-admin and confirm visiting `/admin` shows 403
6. Run unit tests: `pnpm test` and e2e: `npx playwright test`

Notes / TODOs:
- Management endpoints (suspend/activate/change role/delete) are placeholders with TODO comments; implement when backend endpoints are available
- Ensure backend provides counts/aggregates for accurate stats cards (currently derived from fetched lists)

Commits:
- Use prefixes: `feat(admin):`, `test(admin):`, `chore(admin):`

Please review and run the QA steps. If anything should be refactored or moved into shared components, I can tidy it up next. (GitHub Copilot - Raptor mini (Preview))