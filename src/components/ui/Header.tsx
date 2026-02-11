'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell, X, Check, Settings } from 'lucide-react'
import { format } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import type { Notification, Owner } from '@/lib/supabase/types'
import Link from 'next/link'

interface HeaderProps {
  currentUser: Owner
}

export function Header({ currentUser }: HeaderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(true)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const unreadCount = notifications.filter(n => !n.read).length

  useEffect(() => {
    fetchNotifications()
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchNotifications = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('owner', currentUser)
      .order('created_at', { ascending: false })
      .limit(20)

    setNotifications((data || []) as unknown as Notification[])
    setLoading(false)
  }

  const markAsRead = async (id: string) => {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id)

    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const markAllAsRead = async () => {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('owner', currentUser)
      .eq('read', false)

    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    )
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'follow_up':
        return 'bg-amber-50 text-amber-600'
      case 'reminder':
        return 'bg-orange-50 text-orange-600'
      default:
        return 'bg-stone-100 text-stone-600'
    }
  }

  return (
    <header className="h-14 bg-white border-b border-[var(--color-border)] flex items-center justify-end px-6 gap-2">
      <Link
        href="/settings"
        className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-stone-100 rounded-lg transition"
        title="Settings"
      >
        <Settings className="w-5 h-5" />
      </Link>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="relative p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-stone-100 rounded-lg transition"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 text-white text-xs rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary)' }}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {showDropdown && (
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-[var(--color-border)] z-50 overflow-hidden">
            <div className="flex items-center justify-between p-3 border-b border-[var(--color-border)]">
              <h3 className="font-semibold text-[var(--color-text)]">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm font-medium hover:opacity-80" style={{ color: 'var(--color-primary)' }}
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-[var(--color-text-muted)] text-sm">
                  Loading...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-[var(--color-text-muted)]">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 border-b border-[var(--color-border)] hover:bg-stone-50 transition ${
                      !notification.read ? 'bg-amber-50/30' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getNotificationIcon(notification.type)}`}>
                        <Bell className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--color-text)]">
                          {notification.title}
                        </p>
                        <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
                          {notification.message}
                        </p>
                        <p className="text-xs text-[var(--color-text-muted)] mt-1">
                          {format(new Date(notification.created_at), 'MMM d, h:mm a')}
                        </p>
                      </div>
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text)] rounded"
                          title="Mark as read"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    {notification.link && (
                      <Link
                        href={notification.link}
                        className="block mt-2 text-sm font-medium hover:opacity-80"
                        style={{ color: 'var(--color-primary)' }}
                        onClick={() => {
                          markAsRead(notification.id)
                          setShowDropdown(false)
                        }}
                      >
                        View details
                      </Link>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="p-2 border-t border-[var(--color-border)]">
              <Link
                href="/settings"
                className="block text-center text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] py-2"
                onClick={() => setShowDropdown(false)}
              >
                Notification Settings
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
