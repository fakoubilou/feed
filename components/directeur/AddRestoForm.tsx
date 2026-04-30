'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/components/Toast'

export function AddRestoForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [taux, setTaux] = useState('12.50')
  const [loading, setLoading] = useState(false)

  async function handleAdd() {
    if (!name.trim()) { toast('⚠ Entre un nom'); return }
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('restaurants')
      .insert({ name: name.trim(), taux_horaire: parseFloat(taux) || 12.5 })

    if (error) { toast('⚠ ' + error.message); setLoading(false); return }
    toast('Restaurant ajouté ✓')
    setName('')
    setTaux('12.50')
    setLoading(false)
    router.refresh()
  }

  return (
    <>
      <div className="field">
        <label>Nom</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Bistrot du Port" />
      </div>
      <div className="field">
        <label>Taux horaire €/h</label>
        <input type="number" value={taux} onChange={e => setTaux(e.target.value)} step={0.5} />
      </div>
      <button className="btn-ghost" onClick={handleAdd} disabled={loading}>
        {loading ? 'Ajout…' : 'Ajouter le restaurant'}
      </button>
    </>
  )
}
