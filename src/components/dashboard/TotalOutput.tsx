'use client'

import { Phone, Linkedin, Mail } from 'lucide-react'

interface TotalOutputProps {
  title: string
  count: number
  icon: 'phone' | 'linkedin' | 'email'
}

export function TotalOutput({ title, count, icon }: TotalOutputProps) {
  const IconComponent = icon === 'phone' ? Phone : icon === 'linkedin' ? Linkedin : Mail
  const iconBg = icon === 'phone' ? 'bg-blue-100' : icon === 'linkedin' ? 'bg-sky-100' : 'bg-purple-100'
  const iconColor = icon === 'phone' ? 'text-blue-600' : icon === 'linkedin' ? 'text-sky-600' : 'text-purple-600'

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center`}>
          <IconComponent className={`w-6 h-6 ${iconColor}`} />
        </div>
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{count}</p>
        </div>
      </div>
    </div>
  )
}
