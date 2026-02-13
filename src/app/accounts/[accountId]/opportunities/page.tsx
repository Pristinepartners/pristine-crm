'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { SubAccount, SubAccountOpportunity } from '@/lib/supabase/types'
import {
  Briefcase,
  DollarSign,
  Plus,
  X,
  Clock,
  ChevronRight,
  GripVertical,
} from 'lucide-react'

export default function OpportunitiesPage() {
  const { accountId } = useParams<{ accountId: string }>()
  const [opportunities, setOpportunities] = useState<SubAccountOpportunity[]>([])
  const [account, setAccount] = useState<SubAccount | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [dragItem, setDragItem] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [accountId])

  async function loadData() {
    setLoading(true)
    const [{ data: acctData }, { data: oppsData }] = await Promise.all([
      supabase.from('sub_accounts').select('*').eq('id', accountId).single(),
      supabase.from('sub_account_opportunities').select('*').eq('sub_account_id', accountId).order('created_at', { ascending: false }),
    ])

    if (acctData) {
      const parsed = {
        ...acctData,
        pipeline_stages: typeof acctData.pipeline_stages === 'string'
          ? JSON.parse(acctData.pipeline_stages)
          : acctData.pipeline_stages,
      } as unknown as SubAccount
      setAccount(parsed)
    }
    setOpportunities((oppsData || []) as unknown as SubAccountOpportunity[])
    setLoading(false)
  }

  const stages: string[] = account?.pipeline_stages || []

  const getStageOpps = (stage: string) => opportunities.filter(o => o.stage === stage && !o.closed_at)
  const getStageValue = (stage: string) => getStageOpps(stage).reduce((s, o) => s + Number(o.value), 0)

  async function handleDrop(oppId: string, newStage: string) {
    await supabase.from('sub_account_opportunities').update({ stage: newStage }).eq('id', oppId)
    setOpportunities(prev => prev.map(o => o.id === oppId ? { ...o, stage: newStage } : o))
    setDragItem(null)
  }

  async function handleAddOpp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    await supabase.from('sub_account_opportunities').insert({
      sub_account_id: accountId,
      contact_name: form.get('contact_name') as string,
      business_name: form.get('business_name') as string || null,
      value: Number(form.get('value')) || 0,
      stage: form.get('stage') as string || stages[0],
      next_follow_up: form.get('next_follow_up') as string || null,
    })
    setShowAddModal(false)
    loadData()
  }

  const totalPipeline = opportunities.filter(o => !o.closed_at).reduce((s, o) => s + Number(o.value), 0)

  if (loading) {
    return <div className="p-8 text-center text-[var(--color-text-secondary)]">Loading pipeline...</div>
  }

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Pipeline</h1>
          <p className="text-[var(--color-text-secondary)] mt-1">
            {opportunities.filter(o => !o.closed_at).length} active deals &middot; ${totalPipeline.toLocaleString('en-US')} total value
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition text-sm"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          <Plus className="w-4 h-4" />
          Add Deal
        </button>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-4 min-h-[500px]" style={{ minWidth: stages.length * 280 }}>
          {stages.map((stage) => {
            const stageOpps = getStageOpps(stage)
            const stageValue = getStageValue(stage)
            return (
              <div
                key={stage}
                className="flex-1 min-w-[260px] flex flex-col"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  if (dragItem) handleDrop(dragItem, stage)
                }}
              >
                <div className="bg-stone-100 rounded-t-lg px-3 py-2.5 border border-b-0 border-[var(--color-border)]">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-[var(--color-text)]">{stage}</h3>
                    <span className="text-xs text-[var(--color-text-muted)] bg-white px-2 py-0.5 rounded-full">{stageOpps.length}</span>
                  </div>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                    ${stageValue.toLocaleString('en-US')}
                  </p>
                </div>
                <div className="flex-1 bg-stone-50 rounded-b-lg border border-t-0 border-[var(--color-border)] p-2 space-y-2 overflow-y-auto">
                  {stageOpps.map((opp) => (
                    <div
                      key={opp.id}
                      draggable
                      onDragStart={() => setDragItem(opp.id)}
                      onDragEnd={() => setDragItem(null)}
                      className={`bg-white rounded-lg border border-[var(--color-border)] p-3 cursor-grab active:cursor-grabbing hover:shadow-sm transition ${
                        dragItem === opp.id ? 'opacity-50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <GripVertical className="w-4 h-4 text-[var(--color-text-muted)] mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-[var(--color-text)] truncate">{opp.contact_name}</p>
                          {opp.business_name && (
                            <p className="text-xs text-[var(--color-text-secondary)] truncate">{opp.business_name}</p>
                          )}
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-sm font-semibold text-green-600">
                              ${Number(opp.value).toLocaleString('en-US')}
                            </span>
                            {opp.next_follow_up && (
                              <span className="text-[10px] text-[var(--color-text-muted)] flex items-center gap-0.5">
                                <Clock className="w-3 h-3" />
                                {new Date(opp.next_follow_up).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {stageOpps.length === 0 && (
                    <div className="text-center py-8 text-xs text-[var(--color-text-muted)]">
                      Drop deals here
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Add Deal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-xl w-full max-w-lg shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-[var(--color-border)]">
              <h2 className="text-lg font-semibold text-[var(--color-text)]">Add Deal</h2>
            </div>
            <form onSubmit={handleAddOpp} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Contact Name *</label>
                <input name="contact_name" required className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg text-sm focus:ring-2 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Business</label>
                  <input name="business_name" className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg text-sm focus:ring-2 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Value ($)</label>
                  <input name="value" type="number" className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg text-sm focus:ring-2 outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Stage</label>
                  <select name="stage" className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg text-sm">
                    {stages.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Follow-up Date</label>
                  <input name="next_follow_up" type="date" className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg text-sm focus:ring-2 outline-none" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 border border-[var(--color-border-strong)] rounded-lg text-sm hover:bg-stone-50">Cancel</button>
                <button type="submit" className="px-4 py-2 text-white rounded-lg text-sm hover:opacity-90" style={{ backgroundColor: 'var(--color-primary)' }}>Add Deal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
