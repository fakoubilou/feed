'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/components/Toast'
import type { Restaurant } from '@/lib/supabase/types'

type Role = 'manager' | 'directeur'

export function LoginForm({ restaurants }: { restaurants: Restaurant[] }) {
  const router = useRouter()
  const [role, setRole] = useState<Role>('manager')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    if (!email || !password) { toast('⚠ Email et mot de passe requis'); return }
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast('⚠ ' + error.message)
      setLoading(false)
      return
    }
    router.refresh()
  }

  return (
    <div className="login-wrap up">
      <div className="brand-block" style={{ textAlign: 'center', marginBottom: 48 }}>
        <div className="brand-logo" style={{
          fontSize: 52, fontWeight: 800, letterSpacing: '-0.04em',
          background: 'linear-gradient(135deg, #ffffff 0%, #a0aaff 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', lineHeight: 1
        }}>Feed.</div>
        <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--sub)', letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: 10 }}>
          Pilotage opérationnel
        </div>
      </div>

      <div className="role-toggle" style={{ display: 'flex', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14, padding: 4, marginBottom: 20, gap: 4 }}>
        <button
          className={'rtab' + (role === 'manager' ? ' active' : '')}
          onClick={() => setRole('manager')}
          style={{ flex: 1, background: role === 'manager' ? 'var(--accent)' : 'none', border: 'none', borderRadius: 10, color: role === 'manager' ? '#fff' : 'var(--sub)', cursor: 'pointer', fontSize: 13, fontWeight: 600, padding: 12, transition: 'all 0.2s', boxShadow: role === 'manager' ? '0 4px 16px var(--accent-glow)' : 'none' }}
        >Manager</button>
        <button
          className={'rtab' + (role === 'directeur' ? ' active' : '')}
          onClick={() => setRole('directeur')}
          style={{ flex: 1, background: role === 'directeur' ? 'var(--accent)' : 'none', border: 'none', borderRadius: 10, color: role === 'directeur' ? '#fff' : 'var(--sub)', cursor: 'pointer', fontSize: 13, fontWeight: 600, padding: 12, transition: 'all 0.2s', boxShadow: role === 'directeur' ? '0 4px 16px var(--accent-glow)' : 'none' }}
        >Directeur</button>
      </div>

      <div className="field">
        <label>Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="vous@example.com" />
      </div>
      <div className="field">
        <label>Mot de passe</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === 'Enter' && handleLogin()} />
      </div>

      <button className="btn-main" onClick={handleLogin} disabled={loading}>
        {loading ? 'Connexion…' : 'Connexion'}
      </button>
    </div>
  )
}
