'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/components/Toast'
import type { Restaurant } from '@/lib/supabase/types'

export function RestoManageList({ restaurants }: { restaurants: Restaurant[] }) {
  const router = useRouter()
  const [editId, setEditId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleRename(id: string) {
    const trimmed = editName.trim()
    if (!trimmed) return
    const dup = restaurants.find(r => r.id !== id && r.name.toLowerCase() === trimmed.toLowerCase())
    if (dup) { toast('⚠ Ce nom existe déjà'); return }
    setLoading(true)
    const { error } = await createClient().from('restaurants').update({ name: trimmed }).eq('id', id)
    if (error) { toast('⚠ ' + error.message); setLoading(false); return }
    toast('Nom modifié ✓')
    setEditId(null)
    setLoading(false)
    router.refresh()
  }

  async function handleDelete(id: string) {
    setLoading(true)
    const { error } = await createClient().from('restaurants').delete().eq('id', id)
    if (error) {
      toast('⚠ Impossible — des données existent pour ce restaurant')
      setLoading(false)
      setConfirmId(null)
      return
    }
    toast('Restaurant supprimé')
    setConfirmId(null)
    setLoading(false)
    router.refresh()
  }

  if (!restaurants.length) {
    return <div style={{ color: 'var(--sub)', fontSize: 13, padding: '8px 0' }}>Aucun restaurant.</div>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {restaurants.map(r => (
        <div key={r.id} style={{
          background: 'var(--card)', border: '1px solid var(--line2)',
          borderRadius: 12, padding: '14px 16px',
        }}>
          {editId === r.id ? (
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text" value={editName} onChange={e => setEditName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleRename(r.id)}
                autoFocus
                style={{ flex: 1, background: 'var(--input)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', color: 'var(--text)', fontSize: 14 }}
              />
              <button onClick={() => handleRename(r.id)} disabled={loading}
                style={{ background: 'var(--accent)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 700, padding: '8px 14px', cursor: 'pointer' }}>
                ✓
              </button>
              <button onClick={() => setEditId(null)}
                style={{ background: 'transparent', border: '1px solid var(--line2)', borderRadius: 8, color: 'var(--sub)', fontSize: 13, padding: '8px 12px', cursor: 'pointer' }}>
                ✕
              </button>
            </div>
          ) : confirmId === r.id ? (
            <div>
              <div style={{ fontSize: 13, color: 'var(--text)', marginBottom: 12 }}>
                Supprimer <strong>{r.name}</strong> ?<br />
                <span style={{ fontSize: 11, color: 'var(--dim)' }}>Cette action est irréversible.</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => handleDelete(r.id)} disabled={loading}
                  style={{ flex: 1, background: 'var(--red)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 700, padding: '10px', cursor: 'pointer' }}>
                  {loading ? '…' : 'Confirmer'}
                </button>
                <button onClick={() => setConfirmId(null)}
                  style={{ background: 'transparent', border: '1px solid var(--line2)', borderRadius: 8, color: 'var(--sub)', fontSize: 13, padding: '10px 16px', cursor: 'pointer' }}>
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{r.name}</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => { setEditId(r.id); setEditName(r.name) }}
                  style={{ background: 'transparent', border: '1px solid var(--line2)', borderRadius: 8, color: 'var(--sub)', fontSize: 12, padding: '6px 12px', cursor: 'pointer' }}>
                  Modifier
                </button>
                <button onClick={() => setConfirmId(r.id)}
                  style={{ background: 'transparent', border: '1px solid rgba(255,91,91,0.25)', borderRadius: 8, color: 'var(--red)', fontSize: 12, padding: '6px 12px', cursor: 'pointer' }}>
                  Supprimer
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
