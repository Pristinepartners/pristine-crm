'use client'

import { Calendar, UserCheck, Trophy, DollarSign } from 'lucide-react'

interface StatsCardsProps {
  appointmentsBooked: number
  showedUp: number
  salesCount: number
  totalRevenue: number
}

export function StatsCards({ appointmentsBooked, showedUp, salesCount, totalRevenue }: StatsCardsProps) {
  const showUpRate = appointmentsBooked > 0
    ? Math.round((showedUp / appointmentsBooked) * 100)
    : 0

  const stats = [
    {
      label: 'Appointments Booked',
      value: appointmentsBooked.toString(),
      icon: Calendar,
      color: 'bg-[var(--color-primary)]',
    },
    {
      label: 'Show Up Rate',
      value: `${showUpRate}%`,
      subValue: `${showedUp} / ${appointmentsBooked}`,
      icon: UserCheck,
      color: 'bg-green-500',
    },
    {
      label: 'Sales',
      value: salesCount.toString(),
      icon: Trophy,
      color: 'bg-purple-500',
    },
    {
      label: 'Revenue',
      value: `$${totalRevenue.toLocaleString('en-US')}`,
      icon: DollarSign,
      color: 'bg-amber-500',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-[var(--color-card)] rounded-xl p-6 shadow-sm border border-[var(--color-border)]">
          <div className="flex items-center gap-4">
            <div className={`${stat.color} p-3 rounded-lg`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-[var(--color-text-secondary)]">{stat.label}</p>
              <p className="text-2xl font-bold text-[var(--color-text)]">{stat.value}</p>
              {'subValue' in stat && stat.subValue && (
                <p className="text-xs text-[var(--color-text-muted)]">{stat.subValue}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
