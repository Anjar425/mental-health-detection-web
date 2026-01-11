"use client"

import React, { useState, useEffect } from "react"
import { AdminNav } from "../../../components/admin/AdminNav"
import { getExpertGroups, getExpertGroupDetail, getExperts, removeMemberFromGroup, createExpertGroup, updateExpertGroup, addMemberToGroup, API_BASE, getAuthHeaders, deleteExpertGroup } from "../../../services/admin"
import type { ExpertGroup, ExpertGroupDetail, User } from "../../../services/admin"
import { Plus, Users, Eye, UserPlus, UserMinus, Loader2 } from "lucide-react"
import GroupModal, { GroupDetailModal } from "../../../components/admin/GroupModal"

export default function GroupsPage() {
  const [groups, setGroups] = useState<ExpertGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<ExpertGroupDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [experts, setExperts] = useState<User[]>([])
  const [addLoading, setAddLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Fetch groups
  useEffect(() => {
    setLoading(true)
    getExpertGroups()
      .then(setGroups)
      .catch((err) => {
        console.error("getExpertGroups error:", err)
        setErrorMessage(err?.message || String(err))
      })
      .finally(() => setLoading(false))
  }, [])

  // Fetch all experts for add-member dropdown and create modal
  useEffect(() => {
    if (modalOpen || selectedGroup) {
      getExperts({ page: 1, perPage: 100 })
        .then((res) => {
          if (Array.isArray(res)) setExperts(res)
          else setExperts(res.items || [])
        })
    }
  }, [modalOpen, selectedGroup])

  // Open group details
  const handleOpenGroup = async (group: ExpertGroup) => {
    setDetailLoading(true)
    setSelectedGroup(null)
    try {
      const detail = await getExpertGroupDetail(group.id)
      setSelectedGroup(detail)
    } finally {
      setDetailLoading(false)
    }
  }

  // Add member to group (POST body)
  const handleAddMember = async (expertId: string) => {
    if (!selectedGroup) return
    setAddLoading(true)
    try {
      await addMemberToGroup(selectedGroup.id, expertId)
      // Refresh the page to show updated group
      window.location.reload()
    } finally {
      setAddLoading(false)
    }
  }

  // Remove member from group
  const handleRemoveMember = async (expertId: string) => {
    if (!selectedGroup) return
    setAddLoading(true)
    try {
      await removeMemberFromGroup(selectedGroup.id, expertId)
      // Refresh the page to show updated group
      window.location.reload()
    } finally {
      setAddLoading(false)
    }
  }

  // Save edit group
  const handleSaveEdit = async (data: { name: string; description: string }) => {
    if (!selectedGroup) return
    setAddLoading(true)
    try {
      await updateExpertGroup(selectedGroup.id, data)
      // Refresh the page to show updated data
      window.location.reload()
    } finally {
      setAddLoading(false)
    }
  }

  // Create new group (with at least 2 experts)
  const handleCreateGroup = async (data: { name: string; description: string; expert_ids: number[] }) => {
    setAddLoading(true)
    try {
      await createExpertGroup(data)
      // Refresh the page to show new group
      window.location.reload()
    } finally {
      setAddLoading(false)
    }
  }

  // Delete group
  const handleDeleteGroup = async (groupId: number) => {
    setDeleteLoading(true)
    try {
      await deleteExpertGroup(groupId)
      // remove from list and close modal
      setGroups((prev) => prev.filter(g => g.id !== groupId))
      setSelectedGroup(null)
    } catch (err) {
      console.error("delete group failed", err)
      alert((err as any)?.message || "Failed to delete group")
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <AdminNav />

      <main className="flex-1 container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Expert Groups</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">Manage expert groups and their members.</p>
          </div>
          <button
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground font-medium shadow hover:bg-primary/90 transition-colors text-sm w-full sm:w-auto"
            onClick={() => setModalOpen(true)}
          >
            <Plus className="w-4 h-4" /> Create New Group
          </button>
        </div>

        <div className="rounded-md border border-border bg-card text-card-foreground shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground animate-pulse">
              <Loader2 className="inline mr-2 animate-spin" /> Loading groups...
            </div>
          ) : errorMessage ? (
            <div className="p-6 sm:p-8 text-center text-destructive">
              <div className="font-semibold">Network error</div>
              <div className="text-xs sm:text-sm text-muted-foreground">{errorMessage}</div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-2">Check backend, CORS, and auth token. See DevTools Network.</div>
            </div>
          ) : groups.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground italic">
              No expert groups found.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
              {groups.map((group) => (
                <div
                  key={group.id}
                  className="p-4 sm:p-6 bg-card hover:bg-muted/40 cursor-pointer transition-colors border-b border-r border-border flex flex-col gap-2"
                  onClick={() => handleOpenGroup(group)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
                    <span className="font-semibold text-base sm:text-lg truncate">{group.name}</span>
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground mb-2 line-clamp-2">{group.description}</div>
                  <div className="flex items-center gap-2 mt-auto">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-primary/10 text-primary text-xs font-semibold">
                      {group.member_count ?? 0} Members
                    </span>
                    <Eye className="w-4 h-4 text-muted-foreground ml-auto" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Group Details Modal */}
        <GroupDetailModal
          open={!!selectedGroup}
          onClose={() => setSelectedGroup(null)}
          group={selectedGroup}
          onUpdate={handleSaveEdit}
          onAddMember={handleAddMember}
          onRemoveMember={handleRemoveMember}
          loading={addLoading || deleteLoading}
          onDelete={handleDeleteGroup}
          allExperts={experts}
        />

        {/* Create Group Modal */}
        <GroupModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onCreate={handleCreateGroup}
          loading={addLoading}
          experts={experts}
        />
      </main>
    </div>
  )
}
