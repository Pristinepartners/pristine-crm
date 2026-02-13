'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useState, useEffect, useRef } from 'react'
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FolderKanban,
  Home,
  Calendar,
  LogOut,
  ListTodo,
  BarChart3,
  Globe,
  Zap,
  Megaphone,
  FileImage,
  Settings,
  Receipt,
  Building2,
  ChevronDown,
  Eye,
} from 'lucide-react'
import { DEMO_ACCOUNTS, isAdminUser } from '@/lib/demo/data'

interface BrandingSettings {
  logo_url?: string
  company_name?: string
  primary_color?: string
  secondary_color?: string
  accent_color?: string
}

interface SidebarProps {
  userEmail: string
}

export function Sidebar({ userEmail }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [branding, setBranding] = useState<BrandingSettings | null>(null)
  const [showDemoDropdown, setShowDemoDropdown] = useState(false)
  const demoDropdownRef = useRef<HTMLDivElement>(null)

  const isAdmin = isAdminUser(userEmail)

  useEffect(() => {
    async function fetchBranding() {
      const { data } = await supabase
        .from('branding_settings')
        .select('*')
        .single()
      if (data) setBranding(data as BrandingSettings)
    }
    fetchBranding()
  }, [supabase])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (demoDropdownRef.current && !demoDropdownRef.current.contains(event.target as Node)) {
        setShowDemoDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const userName = userEmail.split('@')[0]
  const displayName = userName.charAt(0).toUpperCase() + userName.slice(1)

  const navSections = [
    {
      title: null,
      items: [
        { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
      ]
    },
    {
      title: 'Client Management',
      items: [
        { href: '/clients', icon: Building2, label: 'Clients' },
        { href: '/projects', icon: FolderKanban, label: 'Projects' },
        { href: '/properties', icon: Home, label: 'Properties' },
      ]
    },
    {
      title: 'Marketing',
      items: [
        { href: '/marketing', icon: Megaphone, label: 'Campaigns' },
        { href: '/content', icon: FileImage, label: 'Content Library' },
        { href: '/sites', icon: Globe, label: 'Sites & Funnels' },
        { href: '/automations', icon: Zap, label: 'Automations' },
      ]
    },
    {
      title: 'Sales',
      items: [
        { href: '/opportunities', icon: Briefcase, label: 'Pipeline' },
        { href: '/leads', icon: Users, label: 'Leads' },
      ]
    },
    {
      title: 'Operations',
      items: [
        { href: '/calendar', icon: Calendar, label: 'Calendar' },
        { href: '/tasks', icon: ListTodo, label: 'Tasks' },
        { href: '/invoices', icon: Receipt, label: 'Invoices' },
      ]
    },
    {
      title: 'Insights',
      items: [
        { href: '/reports', icon: BarChart3, label: 'Analytics' },
      ]
    },
    ...(isAdmin ? [{
      title: 'Agency',
      items: [
        { href: '/accounts', icon: Building2, label: 'Sub-Accounts' },
      ]
    }] : []),
  ]

  const sidebarColor = branding?.secondary_color || '#0a0a0a'
  const primaryColor = branding?.primary_color || '#c9a96e'

  return (
    <aside className="w-64 flex flex-col" style={{ backgroundColor: sidebarColor }}>
      <div className="p-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        {branding?.logo_url ? (
          <img
            src={branding.logo_url}
            alt={branding.company_name || 'Logo'}
            className="h-12 object-contain"
          />
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ border: `1px solid ${primaryColor}` }}>
              <span className="text-sm font-medium" style={{ color: primaryColor, fontFamily: 'var(--font-playfair), Playfair Display, Georgia, serif' }}>P</span>
            </div>
            <span className="text-lg font-light tracking-wide" style={{ color: '#f5f0eb', fontFamily: 'var(--font-playfair), Playfair Display, Georgia, serif' }}>
              {branding?.company_name || 'Pristine Partners'}
            </span>
          </div>
        )}
      </div>

      {/* Demo Accounts Dropdown - Only visible to Alex */}
      {isAdmin && (
        <div className="px-4 pt-4" ref={demoDropdownRef}>
          <div className="relative">
            <button
              onClick={() => setShowDemoDropdown(!showDemoDropdown)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition text-sm"
              style={{
                backgroundColor: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'
              }}
            >
              <Eye className="w-4 h-4" style={{ color: primaryColor }} />
              <span className="flex-1 text-left font-medium" style={{ color: '#f5f0eb' }}>
                Demo Accounts
              </span>
              <ChevronDown
                className="w-4 h-4 transition-transform"
                style={{
                  color: '#5a5550',
                  transform: showDemoDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              />
            </button>

            {showDemoDropdown && (
              <div
                className="absolute top-full left-0 right-0 mt-1 rounded-lg shadow-xl z-50 overflow-hidden"
                style={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <div className="px-3 py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <p className="text-[10px] font-medium uppercase tracking-[0.2em]" style={{ color: '#5a5550' }}>
                    Client Previews
                  </p>
                </div>
                {DEMO_ACCOUNTS.map((account) => (
                  <Link
                    key={account.id}
                    href={`/demo/${account.id}`}
                    onClick={() => setShowDemoDropdown(false)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 transition block"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                  >
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ border: `1px solid ${account.primaryColor}` }}
                    >
                      <span className="text-xs font-medium" style={{ color: account.primaryColor }}>
                        {account.logoInitial}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate" style={{ color: '#f5f0eb' }}>
                        {account.companyName}
                      </p>
                      <p className="text-xs" style={{ color: '#5a5550' }}>{account.industry}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <nav className="flex-1 p-4 space-y-5 overflow-y-auto">
        {navSections.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            {section.title && (
              <p className="px-3 mb-2 text-[10px] font-medium uppercase tracking-[0.2em]" style={{ color: '#5a5550' }}>
                {section.title}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = pathname === item.href ||
                  (item.href !== '/' && pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg transition text-sm"
                    style={isActive ? {
                      backgroundColor: `${primaryColor}15`,
                      color: primaryColor,
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
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-lg transition mb-3 text-sm"
          style={pathname === '/settings' ? {
            backgroundColor: `${primaryColor}15`,
            color: primaryColor,
          } : {
            color: '#8a8580',
          }}
        >
          <Settings className="w-[18px] h-[18px]" />
          <span className="font-medium">Settings</span>
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-sm" style={{ color: '#f5f0eb' }}>{displayName}</p>
            <p className="text-xs truncate max-w-[140px]" style={{ color: '#5a5550' }}>{userEmail}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="p-2 rounded-lg transition"
            style={{ color: '#5a5550' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#f5f0eb'
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#5a5550'
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
            title="Sign out"
          >
            <LogOut className="w-[18px] h-[18px]" />
          </button>
        </div>
      </div>
    </aside>
  )
}
