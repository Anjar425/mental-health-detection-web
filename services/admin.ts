// services/admin.ts

export interface User {
  id: string
  username: string
  email: string
  role: string
}

export interface Ranking {
  expert_id: string
  username: string
  email: string
  weight: number
  rank: number
}

export interface Consensus {
  dass21_id: number
  depression: number
  anxiety: number
  stress: number
}

export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  perPage: number
}

/**
 * IMPORTANT:
 * This MUST point to FastAPI backend, NOT Next.js
 */
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000"

/* -------------------------------------------------- */
/* Helpers                                            */
/* -------------------------------------------------- */

function getAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {}
  const token = sessionStorage.getItem("authToken")
  return token ? { Authorization: `Bearer ${token}` } : {}
}

function buildQuery(params: Record<string, any>) {
  const esc = encodeURIComponent
  return Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${esc(k)}=${esc(String(v))}`)
    .join("&")
}

async function handleJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`API ${res.status}: ${text}`)
  }
  return res.json()
}

async function parsePaginatedResponse<T>(
  res: Response,
  page: number,
  perPage: number
): Promise<Paginated<T>> {
  const body = await handleJson<any>(res)

  if (Array.isArray(body)) {
    return {
      items: body,
      total: body.length,
      page,
      perPage,
    }
  }

  if (body?.items && Array.isArray(body.items)) {
    return {
      items: body.items,
      total: body.total ?? body.items.length,
      page,
      perPage,
    }
  }

  throw new Error("Unexpected paginated response format")
}

/* -------------------------------------------------- */
/* USERS                                              */
/* -------------------------------------------------- */

export async function getUsers({
  page = 1,
  perPage = 50,
  q,
  sort,
  order,
  role,
}: {
  page?: number
  perPage?: number
  q?: string
  sort?: string
  order?: "asc" | "desc"
  role?: string
} = {}): Promise<Paginated<User>> {
  const qs = buildQuery({
    page,
    per_page: perPage,
    q,
    sort,
    order,
    role,
  })

  const res = await fetch(
    `${API_BASE}/admin/users${qs ? `?${qs}` : ""}`,
    {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
    }
  )

  return parsePaginatedResponse<User>(res, page, perPage)
}

/* -------------------------------------------------- */
/* EXPERTS                                            */
/* -------------------------------------------------- */

export async function getExperts({
  page = 1,
  perPage = 50,
  q,
  sort,
  order,
}: {
  page?: number
  perPage?: number
  q?: string
  sort?: string
  order?: "asc" | "desc"
} = {}): Promise<Paginated<User>> {
  const qs = buildQuery({
    page,
    per_page: perPage,
    q,
    sort,
    order,
  })

  const res = await fetch(
    `${API_BASE}/admin/experts${qs ? `?${qs}` : ""}`,
    {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
    }
  )

  return parsePaginatedResponse<User>(res, page, perPage)
}

/* -------------------------------------------------- */
/* RANKINGS                                           */
/* -------------------------------------------------- */

export async function getRankings(): Promise<Ranking[]> {
  const res = await fetch(`${API_BASE}/admin/rankings`, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
  })

  return handleJson<Ranking[]>(res)
}

/* -------------------------------------------------- */
/* CONSENSUS                                          */
/* -------------------------------------------------- */

export async function getConsensus(): Promise<Consensus[]> {
  const res = await fetch(`${API_BASE}/admin/consensus`, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
  })

  return handleJson<Consensus[]>(res)
}
