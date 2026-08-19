import { API_BASE, getAuthHeaders, type GroupRankingDetail } from "./admin"

export interface ExpertGroupSummary {
  id: number
  name: string
  description?: string | null
  created_at?: string | null
  member_count: number
}

async function handleJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`API ${res.status}: ${text}`)
  }
  return res.json()
}

export async function getExpertGroupsForPortal(): Promise<ExpertGroupSummary[]> {
  const res = await fetch(`${API_BASE}/expert/groups`, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
  })
  return handleJson<ExpertGroupSummary[]>(res)
}

export async function getExpertGroupRankingDetail(groupId: number): Promise<GroupRankingDetail> {
  const res = await fetch(`${API_BASE}/expert/groups/${groupId}/rankings`, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
  })
  return handleJson<GroupRankingDetail>(res)
}
