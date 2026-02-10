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

  const sidebarColor = branding?.secondary_color || '#151617'
  const primaryColor = branding?.primary_color || '#2563EB'

  return (
    <aside className="w-64 flex flex-col" style={{ backgroundColor: sidebarColor }}>
      <div className="p-6 border-b border-gray-700">
        {branding?.logo_url ? (
          <img
            src={branding.logo_url}
            alt={branding.company_name || 'Logo'}
            className="h-12 object-contain"
          />
        ) : (
          <h1 className="text-xl font-bold text-white">{branding?.company_name || 'Pristine Partners'}</h1>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        {navSections.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            {section.title && (
              <p className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {section.title}
              </p>
            )}
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href ||
                  (item.href !== '/' && pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                      isActive
                        ? 'text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                    style={isActive ? { backgroundColor: primaryColor } : undefined}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-700">
        <Link
          href="/settings"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition mb-3 ${
            pathname === '/settings'
              ? 'text-white'
              : 'text-gray-300 hover:bg-gray-700 hover:text-white'
          }`}
          style={pathname === '/settings' ? { backgroundColor: primaryColor } : undefined}
        >
          <Settings className="w-5 h-5" />
          <span className="font-medium">Settings</span>
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-white">{displayName}</p>
            <p className="text-sm text-gray-400 truncate max-w-[140px]">{userEmail}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition"
            title="Sign out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </aside>
  )
}
