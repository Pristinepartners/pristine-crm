'use client'

interface OutputByOwnerProps {
  title: string
  alexCount: number
  mikailCount: number
}

export function OutputByOwner({ title, alexCount, mikailCount }: OutputByOwnerProps) {
  const total = alexCount + mikailCount

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-gray-600">Alex</span>
            <span className="text-sm font-bold text-gray-900">{alexCount}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div
              className="bg-blue-500 h-3 rounded-full transition-all"
              style={{ width: total > 0 ? `${(alexCount / total) * 100}%` : '0%' }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-gray-600">Mikail</span>
            <span className="text-sm font-bold text-gray-900">{mikailCount}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div
              className="bg-green-500 h-3 rounded-full transition-all"
              style={{ width: total > 0 ? `${(mikailCount / total) * 100}%` : '0%' }}
            />
          </div>
        </div>

        <div className="pt-2 border-t border-gray-100">
          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-600">Total</span>
            <span className="text-sm font-bold text-gray-900">{total}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
