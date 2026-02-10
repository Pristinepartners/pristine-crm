'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format, isToday, isTomorrow, isPast, parseISO, startOfWeek, addDays, isSameDay } from 'date-fns'
import { Plus, Check, Circle, Trash2, Calendar, Flag, User, Users, List, CalendarDays, ChevronLeft, ChevronRight, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { DailyTask, Owner } from '@/lib/supabase/types'

interface TasksListProps {
  tasks: DailyTask[]
  currentUser: Owner
}

type Priority = 'low' | 'medium' | 'high'
type ViewMode = 'list' | 'daily' | 'weekly'

const priorityColors: Record<Priority, string> = {
  high: 'text-red-600 bg-red-50',
  medium: 'text-orange-600 bg-orange-50',
  low: 'text-blue-600 bg-blue-50',
}

const priorityLabels: Record<Priority, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
}

const WORK_HOURS = Array.from({ length: 12 }, (_, i) => i + 7) // 7 AM to 6 PM
const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function TasksList({ tasks: initialTasks, currentUser }: TasksListProps) {
  const [tasks, setTasks] = useState(initialTasks)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDate, setNewTaskDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [newTaskTime, setNewTaskTime] = useState('')
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>('medium')
  const [newTaskIsCompanyWide, setNewTaskIsCompanyWide] = useState(false)
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<'all' | 'today' | 'upcoming'>('all')
  const [scope, setScope] = useState<'personal' | 'company'>('personal')
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date()))
  const router = useRouter()
  const supabase = createClient()

  const filteredTasks = tasks.filter(task => {
    // Filter by scope: personal tasks are owner-specific, company tasks are for everyone
    if (scope === 'personal') {
      if (task.is_company_wide) return false
      if (task.owner !== currentUser) return false
    } else {
      if (!task.is_company_wide) return false
    }

    // Filter by date (only for list view)
    if (viewMode === 'list') {
      if (filter === 'today') {
        return isToday(parseISO(task.due_date))
      }
      if (filter === 'upcoming') {
        return !isToday(parseISO(task.due_date))
      }
    }
    return true
  })

  const completedTasks = filteredTasks.filter(t => t.completed)
  const pendingTasks = filteredTasks.filter(t => !t.completed)

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskTitle.trim()) return

    setLoading(true)

    const { data, error } = await supabase
      .from('daily_tasks')
      .insert({
        owner: currentUser,
        title: newTaskTitle.trim(),
        due_date: newTaskDate,
        scheduled_time: newTaskTime || null,
        priority: newTaskPriority,
        is_company_wide: newTaskIsCompanyWide,
        completed: false,
      })
      .select()
      .single()

    if (error) {
      console.error('Error adding task:', error)
      if (error.code === '42P01') {
        alert('The daily_tasks table does not exist. Please run the database migration.')
      } else {
        alert(`Error adding task: ${error.message}`)
      }
      setLoading(false)
      return
    }

    setTasks([data as unknown as DailyTask, ...tasks])
    setNewTaskTitle('')
    setNewTaskDate(format(new Date(), 'yyyy-MM-dd'))
    setNewTaskTime('')
    setNewTaskPriority('medium')
    setNewTaskIsCompanyWide(false)
    setShowAddForm(false)
    setLoading(false)
    router.refresh()
  }

  const handleToggleComplete = async (task: DailyTask) => {
    const newCompleted = !task.completed

    // Optimistic update
    setTasks(prev =>
      prev.map(t => t.id === task.id ? { ...t, completed: newCompleted } : t)
    )

    await supabase
      .from('daily_tasks')
      .update({ completed: newCompleted })
      .eq('id', task.id)

    router.refresh()
  }

  const handleDeleteTask = async (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId))

    await supabase
      .from('daily_tasks')
      .delete()
      .eq('id', taskId)

    router.refresh()
  }

  const getDateLabel = (dateStr: string) => {
    const date = parseISO(dateStr)
    if (isToday(date)) return 'Today'
    if (isTomorrow(date)) return 'Tomorrow'
    if (isPast(date)) return 'Overdue'
    return format(date, 'EEE, MMM d')
  }

  const getDateColor = (dateStr: string, completed: boolean) => {
    if (completed) return 'text-gray-400'
    const date = parseISO(dateStr)
    if (isPast(date) && !isToday(date)) return 'text-red-600'
    if (isToday(date)) return 'text-blue-600'
    return 'text-gray-500'
  }

  // Get tasks for a specific day
  const getTasksForDay = (date: Date) => {
    return filteredTasks.filter(task => isSameDay(parseISO(task.due_date), date))
  }

  // Get tasks for a specific hour on a day
  const getTasksForHour = (date: Date, hour: number) => {
    return filteredTasks.filter(task => {
      if (!isSameDay(parseISO(task.due_date), date)) return false
      if (!task.scheduled_time) return false
      const taskHour = parseInt(task.scheduled_time.split(':')[0])
      return taskHour === hour
    })
  }

  // Get unscheduled tasks for a day (no time set)
  const getUnscheduledTasksForDay = (date: Date) => {
    return filteredTasks.filter(task => {
      if (!isSameDay(parseISO(task.due_date), date)) return false
      return !task.scheduled_time
    })
  }

  // Week days for calendar
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i))

  const navigateWeek = (direction: number) => {
    setCurrentWeekStart(addDays(currentWeekStart, direction * 7))
  }

  const navigateDay = (direction: number) => {
    setCurrentDate(addDays(currentDate, direction))
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Daily Tasks</h1>
          <p className="text-gray-500 mt-1">
            {pendingTasks.length} pending, {completedTasks.length} completed
          </p>
        </div>
        <button
          onClick={() => {
            setNewTaskIsCompanyWide(scope === 'company')
            setShowAddForm(true)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4" />
          Add Task
        </button>
      </div>

      {/* View Toggle */}
      <div className="flex items-center justify-between mb-4">
        {/* Scope Toggle */}
        <div className="inline-flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setScope('personal')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
              scope === 'personal'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <User className="w-4 h-4" />
            My Tasks
          </button>
          <button
            onClick={() => setScope('company')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
              scope === 'company'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Users className="w-4 h-4" />
            Company Tasks
          </button>
        </div>

        {/* View Mode Toggle */}
        <div className="inline-flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
              viewMode === 'list'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <List className="w-4 h-4" />
            List
          </button>
          <button
            onClick={() => setViewMode('daily')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
              viewMode === 'daily'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Daily
          </button>
          <button
            onClick={() => setViewMode('weekly')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
              viewMode === 'weekly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            Weekly
          </button>
        </div>
      </div>

      {/* Date Filters (only for list view) */}
      {viewMode === 'list' && (
        <div className="flex gap-2 mb-6">
          {(['all', 'today', 'upcoming'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === f
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f === 'all' ? 'All Tasks' : f === 'today' ? 'Today' : 'Upcoming'}
            </button>
          ))}
        </div>
      )}

      {/* Add Task Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <form onSubmit={handleAddTask} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Task Title *
              </label>
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="What needs to be done?"
                autoFocus
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={newTaskDate}
                  onChange={(e) => setNewTaskDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time (optional)
                </label>
                <input
                  type="time"
                  value={newTaskTime}
                  onChange={(e) => setNewTaskTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value as Priority)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Task Type
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setNewTaskIsCompanyWide(false)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition ${
                    !newTaskIsCompanyWide
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <User className="w-4 h-4" />
                  Personal
                </button>
                <button
                  type="button"
                  onClick={() => setNewTaskIsCompanyWide(true)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition ${
                    newTaskIsCompanyWide
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  Company-wide
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !newTaskTitle.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Task'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <>
          {/* Pending Tasks */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">Pending Tasks</h2>
            </div>

            {pendingTasks.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Check className="w-8 h-8 mx-auto mb-2 text-green-400" />
                <p>All caught up! No pending tasks.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {pendingTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    currentUser={currentUser}
                    onToggle={() => handleToggleComplete(task)}
                    onDelete={() => handleDeleteTask(task.id)}
                    getDateLabel={getDateLabel}
                    getDateColor={getDateColor}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Completed Tasks */}
          {completedTasks.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="font-semibold text-gray-700">Completed Tasks</h2>
              </div>

              <div className="divide-y divide-gray-100">
                {completedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-4 p-4 hover:bg-gray-50 transition opacity-60"
                  >
                    <button
                      onClick={() => handleToggleComplete(task)}
                      className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center"
                    >
                      <Check className="w-4 h-4 text-white" />
                    </button>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-500 line-through">{task.title}</p>
                      <span className={`flex items-center gap-1 text-xs ${getDateColor(task.due_date, true)} mt-1`}>
                        <Calendar className="w-3 h-3" />
                        {getDateLabel(task.due_date)}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Daily View */}
      {viewMode === 'daily' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Day Navigation */}
          <div className="p-4 border-b flex items-center justify-between">
            <button
              onClick={() => navigateDay(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="text-center">
              <h2 className="font-semibold text-gray-900">
                {format(currentDate, 'EEEE, MMMM d, yyyy')}
              </h2>
              {isToday(currentDate) && (
                <span className="text-sm text-blue-600">Today</span>
              )}
            </div>
            <button
              onClick={() => navigateDay(1)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Unscheduled Tasks */}
          {getUnscheduledTasksForDay(currentDate).length > 0 && (
            <div className="p-4 border-b bg-gray-50">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Unscheduled</h3>
              <div className="space-y-2">
                {getUnscheduledTasksForDay(currentDate).map(task => (
                  <div
                    key={task.id}
                    className={`p-2 rounded-lg text-sm ${
                      task.completed ? 'bg-gray-100 line-through text-gray-500' : 'bg-white border'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleComplete(task)}
                        className={`flex-shrink-0 w-4 h-4 rounded-full border ${
                          task.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'
                        } flex items-center justify-center`}
                      >
                        {task.completed && <Check className="w-3 h-3 text-white" />}
                      </button>
                      <span className="flex-1">{task.title}</span>
                      <span className={`px-2 py-0.5 rounded text-xs ${priorityColors[task.priority as Priority]}`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Time Grid */}
          <div className="divide-y">
            {WORK_HOURS.map(hour => {
              const hourTasks = getTasksForHour(currentDate, hour)
              return (
                <div key={hour} className="flex">
                  <div className="w-20 py-3 px-4 text-sm text-gray-500 text-right border-r">
                    {format(new Date().setHours(hour, 0), 'h a')}
                  </div>
                  <div className="flex-1 min-h-[60px] p-2">
                    {hourTasks.map(task => (
                      <div
                        key={task.id}
                        className={`p-2 rounded-lg text-sm mb-1 ${
                          task.completed
                            ? 'bg-gray-100 line-through text-gray-500'
                            : `${priorityColors[task.priority as Priority]}`
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleComplete(task)}
                            className={`flex-shrink-0 w-4 h-4 rounded-full border ${
                              task.completed ? 'bg-green-500 border-green-500' : 'border-current'
                            } flex items-center justify-center`}
                          >
                            {task.completed && <Check className="w-3 h-3 text-white" />}
                          </button>
                          <span className="flex-1 font-medium">{task.title}</span>
                          <span className="text-xs opacity-75">
                            {task.scheduled_time}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Weekly View */}
      {viewMode === 'weekly' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Week Navigation */}
          <div className="p-4 border-b flex items-center justify-between">
            <button
              onClick={() => navigateWeek(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="font-semibold text-gray-900">
              Week of {format(currentWeekStart, 'MMM d, yyyy')}
            </h2>
            <button
              onClick={() => navigateWeek(1)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Week Grid */}
          <div className="overflow-x-auto">
            <div className="grid grid-cols-8 min-w-[800px]">
              {/* Header */}
              <div className="p-2 border-b border-r bg-gray-50" />
              {weekDays.map((day, i) => (
                <div
                  key={i}
                  className={`p-2 text-center border-b border-r bg-gray-50 ${
                    isToday(day) ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="text-xs text-gray-500">{DAYS_OF_WEEK[day.getDay()]}</div>
                  <div className={`text-lg font-semibold ${isToday(day) ? 'text-blue-600' : 'text-gray-900'}`}>
                    {format(day, 'd')}
                  </div>
                </div>
              ))}

              {/* Time Grid */}
              {WORK_HOURS.map(hour => (
                <>
                  <div key={`hour-${hour}`} className="p-2 text-right text-sm text-gray-500 border-b border-r">
                    {format(new Date().setHours(hour, 0), 'h a')}
                  </div>
                  {weekDays.map((day, dayIndex) => {
                    const hourTasks = getTasksForHour(day, hour)
                    return (
                      <div
                        key={`${hour}-${dayIndex}`}
                        className={`min-h-[50px] border-b border-r p-1 ${
                          isToday(day) ? 'bg-blue-50/30' : ''
                        }`}
                      >
                        {hourTasks.map(task => (
                          <div
                            key={task.id}
                            className={`text-xs p-1 rounded mb-1 truncate cursor-pointer ${
                              task.completed
                                ? 'bg-gray-100 text-gray-500 line-through'
                                : priorityColors[task.priority as Priority]
                            }`}
                            onClick={() => handleToggleComplete(task)}
                            title={task.title}
                          >
                            {task.title}
                          </div>
                        ))}
                      </div>
                    )
                  })}
                </>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function TaskItem({
  task,
  currentUser,
  onToggle,
  onDelete,
  getDateLabel,
  getDateColor,
}: {
  task: DailyTask
  currentUser: Owner
  onToggle: () => void
  onDelete: () => void
  getDateLabel: (date: string) => string
  getDateColor: (date: string, completed: boolean) => string
}) {
  return (
    <div className="flex items-center gap-4 p-4 hover:bg-gray-50 transition">
      <button
        onClick={onToggle}
        className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition flex items-center justify-center"
      >
        <Circle className="w-4 h-4 text-gray-300" />
      </button>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900">{task.title}</p>
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          <span className={`flex items-center gap-1 text-xs ${getDateColor(task.due_date, false)}`}>
            <Calendar className="w-3 h-3" />
            {getDateLabel(task.due_date)}
          </span>
          {task.scheduled_time && (
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              {task.scheduled_time.slice(0, 5)}
            </span>
          )}
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${priorityColors[task.priority as Priority]}`}>
            <Flag className="w-3 h-3" />
            {priorityLabels[task.priority as Priority]}
          </span>
          {task.is_company_wide && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700">
              <Users className="w-3 h-3" />
              Company
            </span>
          )}
          {task.is_company_wide && task.owner !== currentUser && (
            <span className="text-xs text-gray-400">
              by {task.owner.charAt(0).toUpperCase() + task.owner.slice(1)}
            </span>
          )}
        </div>
      </div>

      <button
        onClick={onDelete}
        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )
}
