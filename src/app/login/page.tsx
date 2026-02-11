'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a0a' }}>
      <div className="max-w-md w-full mx-4">
        <div className="rounded-xl p-10" style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-6" style={{ border: '1px solid #c9a96e' }}>
              <span className="text-xl font-medium" style={{ color: '#c9a96e', fontFamily: 'var(--font-playfair), Playfair Display, Georgia, serif' }}>P</span>
            </div>
            <h1 className="text-3xl font-light tracking-wide" style={{ color: '#f5f0eb', fontFamily: 'var(--font-playfair), Playfair Display, Georgia, serif' }}>
              Pristine Partners
            </h1>
            <p className="mt-3 text-xs uppercase tracking-[0.25em]" style={{ color: '#5a5550' }}>
              Client Management
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="px-4 py-3 rounded-lg text-sm" style={{ background: 'rgba(220,38,38,0.1)', color: '#f87171', border: '1px solid rgba(220,38,38,0.2)' }}>
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-medium uppercase tracking-[0.15em] mb-2" style={{ color: '#8a8580' }}>
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg outline-none transition"
                style={{
                  background: '#0a0a0a',
                  border: '1px solid rgba(255,255,255,0.06)',
                  color: '#f5f0eb',
                }}
                onFocus={(e) => e.target.style.borderColor = '#c9a96e'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.06)'}
                placeholder="you@pristinepartners.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium uppercase tracking-[0.15em] mb-2" style={{ color: '#8a8580' }}>
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg outline-none transition"
                style={{
                  background: '#0a0a0a',
                  border: '1px solid rgba(255,255,255,0.06)',
                  color: '#f5f0eb',
                }}
                onFocus={(e) => e.target.style.borderColor = '#c9a96e'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.06)'}
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg text-xs font-medium uppercase tracking-[0.2em] transition disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: '#c9a96e',
                color: '#0a0a0a',
              }}
              onMouseEnter={(e) => { if (!loading) (e.target as HTMLButtonElement).style.background = '#d4b87a' }}
              onMouseLeave={(e) => (e.target as HTMLButtonElement).style.background = '#c9a96e'}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
