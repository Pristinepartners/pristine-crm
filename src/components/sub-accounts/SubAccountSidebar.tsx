'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Calendar,
  Megaphone,
  ChevronDown,
  ArrowLeft,
  Check,
  Settings2,
} from 'lucide-react'
import type { SubAccount } from '@/lib/supabase/types'

interface SubAccountSidebarProps {
  account: SubAccount
  allAccounts: SubAccount[]
  userEmail: string
}

export function SubAccountSidebar({ account, allAccounts, userEmail }: SubAccountSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const basePath = `/accounts/${account.id}`

  const navItems = [
    { href: basePath, icon: LayoutDashboard, label: 'Dashboard' },
    { href: `${basePath}/contacts`, icon: Users, label: 'Contacts' },
    { href: `${basePath}/opportunities`, icon: Briefcase, label: 'Pipeline' },
    { href: `${basePath}/calendar`, icon: Calendar, label: 'Calendar' },
    { href: `${basePath}/social`, icon: Megaphone, label: 'Social Planner' },
  ]

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleAccountSwitch = (accountId: string) => {
    setShowDropdown(false)
    const currentSubPath = pathname.replace(`/accounts/${account.id}`, '')
    router.push(`/accounts/${accountId}${currentSubPath}`)
  }

  return (
    <aside className="w-64 flex flex-col" style={{ backgroundColor: account.secondary_color }}>
      {/* Back to Admin */}
      <div className="px-4 pt-4">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition"
          style={{ color: '#5a5550' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#f5f0eb'
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#5a5550'
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Dashboard
        </Link>
      </div>

      {/* Account Switcher */}
      <div className="p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-full flex items-center gap-3 p-2 rounded-lg transition"
            style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'
            }}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ border: `1px solid ${account.primary_color}` }}
            >
              <span
                className="text-sm font-medium"
                style={{ color: account.primary_color, fontFamily: 'var(--font-playfair), Playfair Display, Georgia, serif' }}
              >
                {account.logo_initial}
              </span>
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: '#f5f0eb' }}>
                {account.company_name}
              </p>
              <p className="text-xs truncate" style={{ color: '#5a5550' }}>
                Sub-Account
              </p>
            </div>
            <ChevronDown
              className="w-4 h-4 flex-shrink-0 transition-transform"
              style={{
                color: '#5a5550',
                transform: showDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            />
          </button>

          {showDropdown && (
            <div
              className="absolute top-full left-0 right-0 mt-1 rounded-lg shadow-xl z-50 overflow-hidden"
              style={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <div className="px-3 py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-[10px] font-medium uppercase tracking-[0.2em]" style={{ color: '#5a5550' }}>
                  Switch Account
                </p>
              </div>
              {allAccounts.map((acc) => (
                <button
                  key={acc.id}
                  onClick={() => handleAccountSwitch(acc.id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 transition"
                  style={{
                    backgroundColor: acc.id === account.id ? 'rgba(255,255,255,0.06)' : 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (acc.id !== account.id) {
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (acc.id !== account.id) {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }
                  }}
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ border: `1px solid ${acc.primary_color}` }}
                  >
                    <span className="text-xs font-medium" style={{ color: acc.primary_color }}>
                      {acc.logo_initial}
                    </span>
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm truncate" style={{ color: '#f5f0eb' }}>
                      {acc.company_name}
                    </p>
                    <p className="text-xs" style={{ color: '#5a5550' }}>{acc.industry}</p>
                  </div>
                  {acc.id === account.id && (
                    <Check className="w-4 h-4 flex-shrink-0" style={{ color: acc.primary_color }} />
                  )}
                </button>
              ))}
              <Link
                href="/accounts"
                className="flex items-center gap-2 px-3 py-2.5 text-xs font-medium transition"
                style={{ color: '#5a5550', borderTop: '1px solid rgba(255,255,255,0.06)' }}
                onClick={() => setShowDropdown(false)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#f5f0eb'
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#5a5550'
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                <Settings2 className="w-3.5 h-3.5" />
                Manage All Accounts
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== basePath && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition text-sm"
              style={isActive ? {
                backgroundColor: `${account.primary_color}15`,
                color: account.primary_color,
              } : {
                color: '#8a8580',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = '#f5f0eb'
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = '#8a8580'
                  e.currentTarget.style.backgroundColor = 'transparent'
                }
              }}
            >
              <item.icon className="w-[18px] h-[18px]" />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="px-3">
          <div
            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium"
            style={{ backgroundColor: `${account.primary_color}15`, color: account.primary_color }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: account.primary_color }} />
            Sub-Account
          </div>
          <p className="text-xs mt-2 truncate" style={{ color: '#5a5550' }}>
            Viewing as: {userEmail}
          </p>
        </div>
      </div>
    </aside>
  )
}
