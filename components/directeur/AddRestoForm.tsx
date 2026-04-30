'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/components/Toast'
import type { Restaurant } from '@/lib/supabase/types'

export function AddRestoForm({ existing }: { existing: Restaurant[] }) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleAdd() {
    const trimmed = name.trim()
    if (!trimmed) { toast('⚠ Entre un nom'); return }
    const dup = existing.find(r => r.name.toLowerCase() === trimmed.toLowerCase())
    if (dup) { toast('⚠ Ce restaurant existe déjà'); return }
    setLoading(true)
    const { error } = await createClient().from('restaurants').insert({ name: trimmed, taux_horaire: 15 })
    if (error) { toast('⚠ ' + error.message); setLoading(false); return }
    toast('Restaurant ajouté ✓')
    setName('')
    setLoading(false)
    router.refresh()
  }

  return (
    <>
      <div className="field">
        <label>Nom</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)}
          placeholder="Bistrot du Port"
          onKeyDown={e => e.key === 'Enter' && handleAdd()} />
      </div>
      <button className="btn-ghost" onClick={handleAdd} disabled={loading}>
        {loading ? 'Ajout…' : 'Ajouter le restaurant'}
      </button>
    </>
  )
}
