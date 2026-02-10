'use client'

import { useState } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Pipeline, Opportunity, Contact } from '@/lib/supabase/types'
import { OpportunityCard } from '../kanban/OpportunityCard'
import { OpportunitySidebar } from '../kanban/OpportunitySidebar'
import { KanbanFilters } from '../kanban/KanbanFilters'
import { AddOpportunityModal } from '../kanban/AddOpportunityModal'
import { Plus, Search, ChevronDown } from 'lucide-react'

interface OpportunityWithContact extends Opportunity {
  contact: Contact
}

interface OpportunitiesBoardProps {
  pipeline: Pipeline
  allPipelines: Pipeline[]
  opportunities: OpportunityWithContact[]
  initialOwnerFilter?: string
  initialFollowUpFilter?: string
}

export function OpportunitiesBoard({
  pipeline,
  allPipelines,
  opportunities: initialOpportunities,
  initialOwnerFilter,
  initialFollowUpFilter,
}: OpportunitiesBoardProps) {
  const [opportunities, setOpportunities] = useState(initialOpportunities)
  const [showAddModal, setShowAddModal] = useState(false)
  const [addToStage, setAddToStage] = useState<string | null>(null)
  const [selectedOpportunity, setSelectedOpportunity] = useState<OpportunityWithContact | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [pipelineDropdownOpen, setPipelineDropdownOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const stages = pipeline.stages as string[]

  // Filter opportunities by search query
  const filteredOpportunities = opportunities.filter((opp) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      opp.contact?.name?.toLowerCase().includes(query) ||
      opp.contact?.business_name?.toLowerCase().includes(query) ||
      opp.contact?.email?.toLowerCase().includes(query)
    )
  })

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return

    const { draggableId, destination } = result
    const newStage = destination.droppableId

    // Optimistic update
    setOpportunities((prev) =>
      prev.map((opp) =>
        opp.id === draggableId ? { ...opp, stage: newStage } : opp
      )
    )

    // Update in database
    await supabase
      .from('opportunities')
      .update({ stage: newStage })
      .eq('id', draggableId)

    router.refresh()
  }

  const handleAddOpportunity = (stage: string) => {
    setAddToStage(stage)
    setShowAddModal(true)
  }

  const handlePipelineChange = (pipelineId: string) => {
    setPipelineDropdownOpen(false)
    router.push(`/opportunities/${pipelineId}`)
  }

  const getOpportunitiesForStage = (stage: string) => {
    return filteredOpportunities.filter((opp) => opp.stage === stage)
  }

  return (
    <>
      <div className="p-6 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            {/* Pipeline Dropdown */}
            <div className="relative">
              <button
                onClick={() => setPipelineDropdownOpen(!pipelineDropdownOpen)}
                className="flex items-center gap-2 text-2xl font-bold text-gray-900 hover:text-gray-700 transition"
              >
                {pipeline.name}
                <ChevronDown className={`w-6 h-6 transition-transform ${pipelineDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {pipelineDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setPipelineDropdownOpen(false)}
                  />
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-20 py-2">
                    {allPipelines.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handlePipelineChange(p.id)}
                        className={`w-full px-4 py-2 text-left hover:bg-gray-50 transition ${
                          p.id === pipeline.id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                        }`}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
          <p className="text-gray-500">
            {filteredOpportunities.length} of {opportunities.length} opportunities
            {searchQuery && ' (filtered)'}
          </p>
        </div>
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px] max-w-sm">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, business, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>
          <KanbanFilters
            pipelineId={pipeline.id}
            initialOwner={initialOwnerFilter}
            initialFollowUp={initialFollowUpFilter}
            basePath="/opportunities"
          />
        </div>
      </div>

      <div className="flex-1 overflow-x-auto p-6">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-4 h-full min-w-max">
            {stages.map((stage) => {
              const stageOpportunities = getOpportunitiesForStage(stage)
              return (
                <div
                  key={stage}
                  className="w-72 flex-shrink-0 bg-gray-100 rounded-xl flex flex-col"
                >
                  <div className="p-3 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-700">{stage}</h3>
                      <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-sm">
                        {stageOpportunities.length}
                      </span>
                    </div>
                  </div>

                  <Droppable droppableId={stage}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 p-2 space-y-2 overflow-y-auto min-h-[200px] ${
                          snapshot.isDraggingOver ? 'bg-blue-50' : ''
                        }`}
                      >
                        {stageOpportunities.map((opportunity, index) => (
                          <Draggable
                            key={opportunity.id}
                            draggableId={opportunity.id}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                <OpportunityCard
                                  opportunity={opportunity}
                                  isDragging={snapshot.isDragging}
                                  onClick={() => setSelectedOpportunity(opportunity)}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>

                  <div className="p-2 border-t border-gray-200">
                    <button
                      onClick={() => handleAddOpportunity(stage)}
                      className="w-full flex items-center justify-center gap-2 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition"
                    >
                      <Plus className="w-4 h-4" />
                      <span className="text-sm">Add</span>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </DragDropContext>
      </div>

      {showAddModal && addToStage && (
        <AddOpportunityModal
          pipelineId={pipeline.id}
          stage={addToStage}
          onClose={() => {
            setShowAddModal(false)
            setAddToStage(null)
          }}
          onSuccess={() => {
            setShowAddModal(false)
            setAddToStage(null)
            router.refresh()
          }}
        />
      )}

      {selectedOpportunity && (
        <OpportunitySidebar
          opportunity={selectedOpportunity}
          pipelineName={pipeline.name}
          pipelines={allPipelines}
          onClose={() => setSelectedOpportunity(null)}
          onUpdate={() => {
            setSelectedOpportunity(null)
            router.refresh()
          }}
        />
      )}
    </>
  )
}
