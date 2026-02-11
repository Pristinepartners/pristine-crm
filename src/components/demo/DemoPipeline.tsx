'use client'

import { useState } from 'react'
import { DollarSign, Clock, User, MoreHorizontal, Filter, Search } from 'lucide-react'
import type { DemoAccount, DemoOpportunity } from '@/lib/demo/data'

interface DemoPipelineProps {
  account: DemoAccount
}

export function DemoPipeline({ account }: DemoPipelineProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [draggedCard, setDraggedCard] = useState<string | null>(null)
  const [opportunities, setOpportunities] = useState(account.opportunities)

  const filteredOpps = opportunities.filter(opp =>
    opp.contact_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    opp.business_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getOppsForStage = (stage: string) => {
    return filteredOpps.filter(opp => opp.stage === stage)
  }

  const getStageValue = (stage: string) => {
    return getOppsForStage(stage).reduce((sum, opp) => sum + opp.value, 0)
  }

  const totalValue = opportunities.reduce((sum, opp) => sum + opp.value, 0)

  const formatValue = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`
    return `$${value}`
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'No date'
    const date = new Date(dateStr)
    const now = new Date()
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    if (diffDays < 7) return `In ${diffDays} days`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  // Stage colors based on position in pipeline
  const getStageColor = (index: number, total: number) => {
    const progress = index / (total - 1)
    if (progress < 0.33) return { bg: 'bg-stone-50', border: 'border-stone-200', text: 'text-stone-700' }
    if (progress < 0.66) return { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' }
    return { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' }
  }

  const handleDragStart = (oppId: string) => {
    setDraggedCard(oppId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (stage: string) => {
    if (draggedCard) {
      setOpportunities(prev =>
        prev.map(opp =>
          opp.id === draggedCard ? { ...opp, stage } : opp
        )
      )
      setDraggedCard(null)
    }
  }

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Pipeline</h1>
          <p className="text-[var(--color-text-secondary)] mt-1">
            {opportunities.length} opportunities &middot; {formatValue(totalValue)} total value
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
            <input
              type="text"
              placeholder="Search deals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 border border-[var(--color-border-strong)] rounded-lg text-sm focus:ring-2 focus:border-transparent outline-none w-56"
            />
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition text-sm"
            style={{ backgroundColor: account.primaryColor }}
          >
            + Add Deal
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-4 min-h-[500px]" style={{ minWidth: `${account.pipelineStages.length * 280}px` }}>
          {account.pipelineStages.map((stage, stageIndex) => {
            const stageOpps = getOppsForStage(stage)
            const stageValue = getStageValue(stage)
            const colors = getStageColor(stageIndex, account.pipelineStages.length)

            return (
              <div
                key={stage}
                className="flex-1 min-w-[260px] flex flex-col"
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(stage)}
              >
                {/* Stage Header */}
                <div className={`rounded-t-lg px-4 py-3 ${colors.bg} border ${colors.border} border-b-0`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-semibold text-sm ${colors.text}`}>{stage}</h3>
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center text-xs text-white"
                        style={{ backgroundColor: account.primaryColor }}
                      >
                        {stageOpps.length}
                      </span>
                    </div>
                    <span className="text-xs font-medium" style={{ color: account.primaryColor }}>
                      {formatValue(stageValue)}
                    </span>
                  </div>
                </div>

                {/* Cards */}
                <div className="flex-1 bg-stone-50/50 rounded-b-lg border border-[var(--color-border)] p-2 space-y-2 overflow-y-auto">
                  {stageOpps.map((opp) => (
                    <div
                      key={opp.id}
                      draggable
                      onDragStart={() => handleDragStart(opp.id)}
                      className={`bg-white rounded-lg p-3 shadow-sm border border-[var(--color-border)] cursor-grab hover:shadow-md transition ${
                        draggedCard === opp.id ? 'opacity-50' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-[var(--color-text)] text-sm truncate">{opp.contact_name}</p>
                          {opp.business_name && (
                            <p className="text-xs text-[var(--color-text-secondary)] truncate">{opp.business_name}</p>
                          )}
                        </div>
                        <button className="p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text)] rounded">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5" style={{ color: account.primaryColor }} />
                          <span className="text-sm font-semibold" style={{ color: account.primaryColor }}>
                            {formatValue(opp.value)}
                          </span>
                        </div>
                        {opp.next_follow_up && (
                          <div className="flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
                            <Clock className="w-3 h-3" />
                            {formatDate(opp.next_follow_up)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {stageOpps.length === 0 && (
                    <div className="text-center py-8 text-xs text-[var(--color-text-muted)]">
                      No deals in this stage
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Pipeline Summary Bar */}
      <div className="mt-4 bg-white rounded-xl p-4 shadow-sm border border-[var(--color-border)]">
        <div className="flex items-center gap-1">
          {account.pipelineStages.map((stage, index) => {
            const count = getOppsForStage(stage).length
            const width = opportunities.length > 0
              ? Math.max(count / opportunities.length * 100, 5)
              : 100 / account.pipelineStages.length

            return (
              <div
                key={stage}
                className="h-2 rounded-full transition-all"
                style={{
                  width: `${width}%`,
                  backgroundColor: count > 0 ? account.primaryColor : '#e7e5e4',
                  opacity: 0.3 + (index / account.pipelineStages.length) * 0.7,
                }}
                title={`${stage}: ${count} deals`}
              />
            )
          })}
        </div>
        <div className="flex justify-between mt-2 text-xs text-[var(--color-text-secondary)]">
          <span>{account.pipelineStages[0]}</span>
          <span>{account.pipelineStages[account.pipelineStages.length - 1]}</span>
        </div>
      </div>
    </div>
  )
}
