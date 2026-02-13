'use client'

import type { SubAccount } from '@/lib/supabase/types'

interface SubAccountHeaderProps {
  account: SubAccount
}

export function SubAccountHeader({ account }: SubAccountHeaderProps) {
  return (
    <>
      <div className="h-1" style={{ backgroundColor: account.primary_color }} />
      <header className="h-14 bg-white border-b border-[var(--color-border)] flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-[var(--color-text)]">{account.company_name}</h2>
          <span className="text-sm text-[var(--color-text-secondary)]">{account.industry}</span>
        </div>
      </header>
    </>
  )
}
