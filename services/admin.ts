// -------------------- EXPERT GROUPS --------------------

export interface ExpertGroup {
  id: number
  name: string
  description: string
  created_at: string
  member_count?: number
}

export interface ExpertGroupDetail extends ExpertGroup {
  members: User[]
}

export interface ExpertCapability {
  education_level?: string | null
  publication_count: number
  patient_count: number
  flight_hours: number
  weight_JT: number
  weight_Pat: number
  weight_Pend: number
  weight_Pub: number
}

export interface ExpertPreference {
  question_id: number
  depression: number
  anxiety: number
  stress: number
}

export interface GroupExpertRanking {
  user_id: number
  username: string
  email: string
  influence_score: number
  influence_percent: number
  capability: ExpertCapability
  preferences: ExpertPreference[]
  rank: number
}

export interface GroupConsensusRow {
  question_id: number
  depression: number
  anxiety: number
  stress: number
}

export interface WeightInfo {
  signature?: string
  created_at?: string
  meta?: Record<string, any>
  weights_by_user?: Array<{ user_id: number; weight: number }>
}

export interface GroupRankingDetail {
  group_id: number
  group_name: string
  description?: string | null
  rankings: GroupExpertRanking[]
  consensus_matrix: GroupConsensusRow[]
  weights_info?: WeightInfo
}

/**
 * Get all expert groups.
 * GET /groups
 */
export async function getExpertGroups(): Promise<ExpertGroup[]> {
  try {
    // Helpful runtime debug to confirm which API_BASE is used in the browser
    try {
      // eslint-disable-next-line no-console
      console.debug("getExpertGroups -> API_BASE =", API_BASE)
    } catch {}
    const res = await fetch(`${API_BASE}/admin/groups`, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      mode: "cors",
    })
    return handleJson<ExpertGroup[]>(res)
  } catch (err: any) {
    const msg = err?.message || String(err)
    if (msg === "Failed to fetch" || err instanceof TypeError) {
      throw new Error(
        `Network error: ${msg} — check backend reachable at ${API_BASE}, ensure CORS allows origin, and that you're logged in (Authorization header if required). Open DevTools Network tab to inspect request.`
      )
    }
    throw new Error(`Network error: ${msg}`)
  }
}

/**
 * Get detail of a specific expert group.
 * GET /groups/{id}
 */
export async function getExpertGroupDetail(id: number): Promise<ExpertGroupDetail> {
  const res = await fetch(
    `${API_BASE}/admin/groups/${id}`,
    {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
    }
  )
  return handleJson<ExpertGroupDetail>(res)
}

export async function getGroupRankingDetail(groupId: number): Promise<GroupRankingDetail> {
  try {
    const res = await fetch(`${API_BASE}/admin/groups/${groupId}/rankings`, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
    })
    return handleJson<GroupRankingDetail>(res)
  } catch (err: any) {
    // Network or CORS failures produce TypeError in fetch APIs
    const msg = err?.message || String(err)
    throw new Error(`Network error: ${msg}`)
  }
}

/**
 * Invalidate cached GA weights for a group. The next call to GET /groups/{id}/rankings
 * will re-run the GA and save the new weights.
 * POST /groups/{id}/invalidate-cache
 */
export async function invalidateGroupWeights(groupId: number): Promise<{ deleted: number }> {
  const url = `${API_BASE}/admin/groups/${groupId}/invalidate-cache`
  const headers = { "Content-Type": "application/json", ...getAuthHeaders() }
  // Don't print auth token, but indicate whether one exists
  // Quick client-side guard for missing auth token to avoid ambiguous network errors
  if (!headers.Authorization) {
    throw new Error("Not authenticated: please log in as admin before invalidating group weights.")
  }

  try {
    console.debug("invalidateGroupWeights ->", { url, hasAuth: !!headers.Authorization })
    const res = await fetch(url, {
      method: "POST",
      headers,
      mode: "cors",
    })
    return handleJson<{ deleted: number }>(res)
  } catch (err: any) {
    const msg = err?.message || String(err)
    if (msg === "Failed to fetch" || err instanceof TypeError) {
      throw new Error(
        `Network error: ${msg} — check backend reachable at ${API_BASE}, ensure CORS allows origin, and that you're logged in (Authorization header present). Open DevTools Network tab to inspect request.`
      )
    }
    throw new Error(`Network error: ${msg}`)
  }
} 

/**
 * Recompute & persist GA weights for a group (admin-triggered)
 * POST /groups/{id}/recompute-weights
 */
export async function recomputeGroupWeights(groupId: number): Promise<{ weights: number[]; signature: string }> {
  const url = `${API_BASE}/admin/groups/${groupId}/recompute-weights`
  const headers = { "Content-Type": "application/json", ...getAuthHeaders() }
  // Quick client-side guard for missing auth token to avoid ambiguous network errors
  if (!headers.Authorization) {
    throw new Error("Not authenticated: please log in as admin before recomputing weights.")
  }

  try {
    console.debug("recomputeGroupWeights ->", { url, hasAuth: !!headers.Authorization })
    const res = await fetch(url, {
      method: "POST",
      headers,
      mode: "cors",
    })
    return handleJson<{ weights: number[]; signature: string }>(res)
  } catch (err: any) {
    const msg = err?.message || String(err)
    if (msg === "Failed to fetch" || err instanceof TypeError) {
      throw new Error(
        `Network error: ${msg} — check backend reachable at ${API_BASE}, ensure CORS allows origin, and that you're logged in (Authorization header present). Open DevTools Network tab to inspect request.`
      )
    }
    throw new Error(`Network error: ${msg}`)
  }
}

export async function getGroupSignatureInfo(groupId: number): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/admin/groups/${groupId}/signature-info`, {
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    })
    return handleJson<any>(res)
  } catch (err: any) {
    const msg = err?.message || String(err)
    throw new Error(`Network error: ${msg}`)
  }
}

/**
 * Create a new expert group.
 * POST /groups
 */
export async function createExpertGroup(data: { name: string; description: string; expert_ids: number[] }): Promise<ExpertGroup> {
  const res = await fetch(
    `${API_BASE}/admin/groups`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    }
  )
  return handleJson<ExpertGroup>(res)
}

/**
 * Update an expert group.
 * PUT /groups/{id}
 */
export async function updateExpertGroup(
  id: number,
  data: { name?: string; description?: string }
): Promise<ExpertGroup> {
  const res = await fetch(
    `${API_BASE}/admin/groups/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    }
  )
  return handleJson<ExpertGroup>(res)
}

/**
 * Delete an expert group.
 * DELETE /groups/{id}
 */
export async function deleteExpertGroup(id: number): Promise<{ success: boolean }> {
  const res = await fetch(
    `${API_BASE}/admin/groups/${id}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
    }
  )
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`API ${res.status}: ${text}`)
  }
  return { success: true }
}

/**
 * Add a member to an expert group.
 * POST /groups/{groupId}/members/{expertId}
 * tes branch
 */
export async function addMemberToGroup(groupId: number, expertId: string): Promise<{ success: boolean }> {
  const res = await fetch(
    `${API_BASE}/admin/groups/${groupId}/members/${expertId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
    }
  )
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`API ${res.status}: ${text}`)
  }
  return { success: true }
}

/**
 * Remove a member from an expert group.
 * DELETE /groups/{groupId}/members/{expertId}
 */
export async function removeMemberFromGroup(groupId: number, expertId: string): Promise<{ success: boolean }> {
  const res = await fetch(
    `${API_BASE}/admin/groups/${groupId}/members/${expertId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
    }
  )
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`API ${res.status}: ${text}`)
  }
  return { success: true }
}
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
export const API_BASE =
  process.env.NEXT_PUBLIC_API || "http://localhost:8000"

/* -------------------------------------------------- */
/* Helpers                                            */
/* -------------------------------------------------- */

export function getAuthHeaders(): Record<string, string> {
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
  perPage = 100, // Batas backend
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
  perPage = 100, // Batas backend
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
