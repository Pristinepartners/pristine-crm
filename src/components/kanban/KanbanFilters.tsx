'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { format } from 'date-fns'

interface KanbanFiltersProps {
  pipelineId: string
  initialOwner?: string
  initialFollowUp?: string
  basePath?: string
}

export function KanbanFilters({ pipelineId, initialOwner, initialFollowUp, basePath = '/pipelines' }: KanbanFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateFilters = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`${basePath}/${pipelineId}?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap gap-4">
      <div>
        <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
          Owner
        </label>
        <select
          value={initialOwner || ''}
          onChange={(e) => updateFilters('owner', e.target.value || null)}
          className="px-3 py-2 border border-[var(--color-border-strong)] rounded-lg text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
        >
          <option value="">All owners</option>
          <option value="alex">Alex</option>
          <option value="mikail">Mikail</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
          Follow-up before
        </label>
        <input
          type="date"
          value={initialFollowUp || ''}
          onChange={(e) => updateFilters('followUp', e.target.value || null)}
          className="px-3 py-2 border border-[var(--color-border-strong)] rounded-lg text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
        />
      </div>

      {(initialOwner || initialFollowUp) && (
        <div className="flex items-end">
          <button
            onClick={() => router.push(`${basePath}/${pipelineId}`)}
            className="px-3 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-stone-100 rounded-lg transition"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  )
}
