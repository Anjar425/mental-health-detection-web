# Admin Dashboard

## Routes

- `/admin` – Overview with stats cards and quick links
- `/admin/users` – Manage users (search, copy emails, view actions)
- `/admin/experts` – Manage experts

## API Contract

Endpoints used (Authorization: Bearer <token>):

- GET /admin/users → [{ id, username, email, role }]
- GET /admin/experts → [{ id, username, email, role }]
- GET /admin/rankings → [{ expert_id, username, email, weight, rank }]
- GET /admin/consensus → [{ dass21_id, depression, anxiety, stress }]

Management endpoints (TODO - backend missing):

- POST /admin/users/:id/suspend (TODO)
- POST /admin/users/:id/activate (TODO)
- POST /admin/users/:id/role (body: { role }) (TODO)
- DELETE /admin/users/:id (TODO)

## Auth / Guard

- AdminGuard checks `sessionStorage.getItem('authToken')` and decodes JWT (`role === 'admin'` required).
- Non-admin users are redirected and shown a 403 UI.
- Admin testing credentials: `admin@example.com / admin123` (use existing login endpoint `/auth/login`).

## QA Steps

1. Login as admin at `/auth/login`.
2. Visit `/admin/users` and confirm the list loads and the search works.
3. Try `Copy all emails` and `Copy email` buttons.
4. Login as normal user and verify visiting `/admin` shows 403 and redirects you away.

## Running tests

- Unit tests: `pnpm test` (uses `vitest`)
- E2E: `npx playwright test` (requires Playwright install and configured `baseURL`)

Admin e2e credentials (for QA): `admin@example.com / admin123`
## Notes

- The UI includes TODO markers where management endpoints are missing. When backend endpoints are available, implement service methods in `services/admin.ts` and wire the actions.
- Tests: Unit tests and e2e tests (Playwright) should be added under `tests/` and `e2e/` respectively. See project test conventions.
