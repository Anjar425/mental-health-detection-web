import React, { useState, useEffect } from "react"
import { Plus, Loader2, Search, X, UserMinus } from "lucide-react"
import type { User, ExpertGroupDetail } from "../../services/admin"
import ConfirmDialog from "./ConfirmDialog"

interface GroupModalProps {
  open: boolean
  onClose: () => void
  onCreate: (data: { name: string; description: string; expert_ids: number[] }) => void
  loading?: boolean
  experts: User[]
}

interface GroupDetailModalProps {
  open: boolean
  onClose: () => void
  group: ExpertGroupDetail | null
  onUpdate: (data: { name: string; description: string }) => void
  onAddMember: (expertId: string) => void
  onRemoveMember: (expertId: string) => void
  onDelete?: (groupId: number) => void
  loading?: boolean
  allExperts: User[]
}

export function GroupDetailModal({
  open,
  onClose,
  group,
  onUpdate,
  onAddMember,
  onRemoveMember,
  onDelete,
  loading,
  allExperts
}: GroupDetailModalProps) {
  const [editName, setEditName] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [searchAddExpert, setSearchAddExpert] = useState("")
  const [dropdownAddOpen, setDropdownAddOpen] = useState(false)

  useEffect(() => {
    if (group && open) {
      setEditName(group.name)
      setEditDescription(group.description || "")
      setSearchAddExpert("")
      setDropdownAddOpen(false)
    }
  }, [group, open])

  const [confirmOpen, setConfirmOpen] = useState(false)

  const handleDeleteConfirm = () => {
    if (!group || !onDelete) return
    onDelete(group.id)
    setConfirmOpen(false)
  }

  if (!open || !group) return null

  const filteredExperts = allExperts.filter(expert =>
    expert.username.toLowerCase().includes(searchAddExpert.toLowerCase()) ||
    expert.email.toLowerCase().includes(searchAddExpert.toLowerCase())
  ).filter(expert => !group.members.find(m => m.id === expert.id))

  const handleSaveEdit = () => {
    onUpdate({ name: editName.trim(), description: editDescription.trim() })
  }

  const handleCancelEdit = () => {
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-card rounded-lg shadow-lg max-w-lg w-full p-6 border border-border relative animate-in fade-in-0 zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <button
          className="absolute top-3 right-3 text-muted-foreground hover:text-destructive"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" />
            Edit Group: {group.name}
          </h3>
        </div>

        <div className="space-y-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Group Name</label>
            <input
              className="w-full border border-border rounded px-3 py-2 bg-background"
              value={editName}
              onChange={e => setEditName(e.target.value)}
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              className="w-full border border-border rounded px-3 py-2 bg-background min-h-[60px]"
              value={editDescription}
              onChange={e => setEditDescription(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              className="px-4 py-2 rounded bg-muted text-foreground hover:bg-muted/80"
              onClick={handleCancelEdit}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 rounded bg-destructive text-destructive-foreground font-medium hover:bg-destructive/90 mr-auto"
              onClick={() => setConfirmOpen(true)}
              disabled={loading}
            >
              Delete Group
            </button>
            <button
              className="px-4 py-2 rounded bg-primary text-primary-foreground font-medium hover:bg-primary/90"
              onClick={handleSaveEdit}
              disabled={loading}
            >
              Save
            </button>
          </div>
        </div>

        <div className="mb-4">
          <div className="font-semibold mb-2 flex items-center gap-2">
            Members <span className="text-xs text-muted-foreground">({group.members.length})</span>
          </div>
          {group.members.length === 0 ? (
            <div className="text-muted-foreground text-sm">No members in this group.</div>
          ) : (
            <ul className="divide-y divide-border mb-2">
              {group.members.map((member: User) => (
                <li key={member.id} className="flex items-center justify-between py-2">
                  <span className="font-mono text-xs">{member.username} <span className="text-muted-foreground">({member.email})</span></span>
                  <button
                    className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                    onClick={() => onRemoveMember(member.id)}
                    disabled={loading}
                  >
                    <UserMinus className="w-4 h-4" /> Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mb-2">
          <label className="block text-sm font-medium mb-1">Add Expert to Group</label>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                className="w-full border border-border rounded px-3 py-2 bg-background pr-10"
                value={searchAddExpert}
                onChange={e => setSearchAddExpert(e.target.value)}
                onFocus={() => setDropdownAddOpen(true)}
                placeholder="Search experts..."
                disabled={loading}
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              {dropdownAddOpen && (
                <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded shadow-lg max-h-40 overflow-y-auto">
                  {filteredExperts.length > 0 ? (
                    filteredExperts.map(expert => (
                      <div
                        key={expert.id}
                        className="px-3 py-2 hover:bg-muted cursor-pointer"
                        onClick={() => {
                          onAddMember(expert.id)
                          setSearchAddExpert("")
                          setDropdownAddOpen(false)
                        }}
                      >
                        <div className="font-medium">{expert.username}</div>
                        <div className="text-sm text-muted-foreground">{expert.email}</div>
                      </div>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-muted-foreground">No experts found</div>
                  )}
                </div>
              )}
            </div>
            <ConfirmDialog
              open={confirmOpen}
              title={`Delete group ${group?.name}`}
              description="This will permanently delete the group and remove all membership. This action cannot be undone."
              onCancel={() => setConfirmOpen(false)}
              onConfirm={handleDeleteConfirm}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function GroupModal({ open, onClose, onCreate, loading, experts }: GroupModalProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [selectedExperts, setSelectedExperts] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [dropdownOpen, setDropdownOpen] = useState(false)

  useEffect(() => {
    if (!open) {
      setName("")
      setDescription("")
      setSelectedExperts([])
      setSearchTerm("")
      setError(null)
    }
  }, [open])

  const filteredExperts = experts.filter(expert =>
    expert.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expert.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSelectExpert = (expert: User) => {
    if (!selectedExperts.find(e => e.id === expert.id)) {
      setSelectedExperts([...selectedExperts, expert])
    }
    setSearchTerm("")
    setDropdownOpen(false)
  }

  const handleRemoveExpert = (expertId: string) => {
    setSelectedExperts(selectedExperts.filter(e => e.id !== expertId))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError("Group name is required.")
      return
    }
    if (selectedExperts.length < 2) {
      setError("Please select at least 2 experts.")
      return
    }
    setError(null)
    onCreate({
      name: name.trim(),
      description: description.trim(),
      expert_ids: selectedExperts.map(e => Number(e.id))
    })
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-card rounded-lg shadow-lg max-w-md w-full p-6 border border-border relative animate-in fade-in-0 zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <button
          className="absolute top-3 right-3 text-muted-foreground hover:text-destructive"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-primary" /> Create New Group
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Group Name</label>
            <input
              className="w-full border border-border rounded px-3 py-2 bg-background"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              disabled={loading}
              placeholder="Enter group name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              className="w-full border border-border rounded px-3 py-2 bg-background min-h-[60px]"
              value={description}
              onChange={e => setDescription(e.target.value)}
              disabled={loading}
              placeholder="Enter group description (optional)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Select Experts (at least 2)</label>
            <div className="relative">
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedExperts.map(expert => (
                  <div key={expert.id} className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded text-sm">
                    {expert.username}
                    <button
                      type="button"
                      onClick={() => handleRemoveExpert(expert.id)}
                      className="text-primary hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="relative">
                <input
                  type="text"
                  className="w-full border border-border rounded px-3 py-2 bg-background pr-10"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  onFocus={() => setDropdownOpen(true)}
                  placeholder="Search experts..."
                  disabled={loading}
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                {dropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded shadow-lg max-h-40 overflow-y-auto">
                    {filteredExperts.length > 0 ? (
                      filteredExperts.map(expert => (
                        <div
                          key={expert.id}
                          className="px-3 py-2 hover:bg-muted cursor-pointer"
                          onClick={() => handleSelectExpert(expert)}
                        >
                          <div className="font-medium">{expert.username}</div>
                          <div className="text-sm text-muted-foreground">{expert.email}</div>
                        </div>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-muted-foreground">No experts found</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          {error && <div className="text-destructive text-sm">{error}</div>}
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              className="px-4 py-2 rounded bg-muted text-foreground hover:bg-muted/80"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 rounded bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
              disabled={loading}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Create
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
