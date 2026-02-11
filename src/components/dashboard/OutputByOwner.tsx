'use client'

interface OutputByOwnerProps {
  title: string
  alexCount: number
  mikailCount: number
}

export function OutputByOwner({ title, alexCount, mikailCount }: OutputByOwnerProps) {
  const total = alexCount + mikailCount

  return (
    <div className="bg-[var(--color-card)] rounded-xl p-6 shadow-sm border border-[var(--color-border)]">
      <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4">{title}</h3>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-[var(--color-text-secondary)]">Alex</span>
            <span className="text-sm font-bold text-[var(--color-text)]">{alexCount}</span>
          </div>
          <div className="w-full bg-stone-100 rounded-full h-3">
            <div
              className="bg-[var(--color-primary)] h-3 rounded-full transition-all"
              style={{ width: total > 0 ? `${(alexCount / total) * 100}%` : '0%' }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-[var(--color-text-secondary)]">Mikail</span>
            <span className="text-sm font-bold text-[var(--color-text)]">{mikailCount}</span>
          </div>
          <div className="w-full bg-stone-100 rounded-full h-3">
            <div
              className="bg-green-500 h-3 rounded-full transition-all"
              style={{ width: total > 0 ? `${(mikailCount / total) * 100}%` : '0%' }}
            />
          </div>
        </div>

        <div className="pt-2 border-t border-[var(--color-border)]">
          <div className="flex justify-between">
            <span className="text-sm font-medium text-[var(--color-text-secondary)]">Total</span>
            <span className="text-sm font-bold text-[var(--color-text)]">{total}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
