'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
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
} from 'lucide-react'

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
