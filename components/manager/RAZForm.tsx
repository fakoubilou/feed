'use client'
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/components/Toast'
import { StaffRow, type StaffMember } from './StaffRow'
import { calcStaffMinutes, minToStr, fmt, ticketMoyen, coprod, coprodColor, coprodLabel } from '@/lib/calculations'
import type { Restaurant } from '@/lib/supabase/types'

let nextId = 1

const emptyStaff = (): StaffMember => ({ id: nextId++, nom: '', dh: '', dm: '', fh: '', fm: '', pause: '' })

export function RAZForm({ restaurant }: { restaurant: Restaurant }) {
  const router = useRouter()
  const [ca, setCa] = useState('')
  const [cov, setCov] = useState('')
  const [offerts, setOfferts] = useState('')
  const [annul, setAnnul] = useState('')
  const [ouv, setOuv] = useState('')
  const [ferm, setFerm] = useState('')
  const [note, setNote] = useState('')
  const [staffList, setStaffList] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(false)

  const totalStaffMinutes = staffList.reduce((acc, s) => {
    const m = calcStaffMinutes(s.dh, s.dm, s.fh, s.fm, parseInt(s.pause) || 0)
    return acc + (m ?? 0)
  }, 0)
  const totalStaffHours = totalStaffMinutes / 60

  const caNum = parseFloat(ca) || 0
  const covNum = parseFloat(cov) || 0
  const ticket = ticketMoyen(caNum, covNum)
  const cp = coprod(totalStaffHours, caNum)

  const addStaff = () => setStaffList(l => [...l, emptyStaff()])
  const updateStaff = useCallback((id: number, updated: StaffMember) =>
    setStaffList(l => l.map(s => s.id === id ? updated : s)), [])
  const removeStaff = useCallback((id: number) =>
    setStaffList(l => l.filter(s => s.id !== id)), [])

  async function submit() {
    if (!caNum || !covNum) { toast('⚠ CA et couverts requis'); return }
    if (totalStaffHours <= 0) { toast('⚠ Ajoute au moins un employé'); return }

    setLoading(true)
    const supabase = createClient()
    const today = new Date().toISOString().split('T')[0]

    const { data: existing } = await supabase
      .from('raz_entries')
      .select('id')
      .eq('restaurant_id', restaurant.id)
      .eq('date', today)
      .maybeSingle()

    let razId: string
    if (existing) {
      const { data, error } = await supabase
        .from('raz_entries')
        .update({ ca: caNum, couverts: covNum, staff_hours: totalStaffHours, offerts: parseFloat(offerts) || 0, annulations: parseFloat(annul) || 0, ouverture: ouv || null, fermeture: ferm || null, note: note || 'R.a.s' })
        .eq('id', existing.id)
        .select('id')
        .single()
      if (error) { toast('⚠ ' + error.message); setLoading(false); return }
      razId = data.id
      await supabase.from('staff_entries').delete().eq('raz_id', razId)
    } else {
      const { data, error } = await supabase
        .from('raz_entries')
        .insert({ restaurant_id: restaurant.id, date: today, ca: caNum, couverts: covNum, staff_hours: totalStaffHours, offerts: parseFloat(offerts) || 0, annulations: parseFloat(annul) || 0, ouverture: ouv || null, fermeture: ferm || null, note: note || 'R.a.s' })
        .select('id')
        .single()
      if (error) { toast('⚠ ' + error.message); setLoading(false); return }
      razId = data.id
    }

    const staffRows = staffList.map(s => ({
      raz_id: razId,
      nom: s.nom || null,
      debut: s.dh ? `${s.dh}h${s.dm || '00'}` : null,
      fin: s.fh ? `${s.fh}h${s.fm || '00'}` : null,
      pause_minutes: parseInt(s.pause) || 0,
      duree_minutes: calcStaffMinutes(s.dh, s.dm, s.fh, s.fm, parseInt(s.pause) || 0),
    }))
    if (staffRows.length) await supabase.from('staff_entries').insert(staffRows)

    toast('RAZ validée ✓')
    setCa(''); setCov(''); setOfferts(''); setAnnul(''); setOuv(''); setFerm(''); setNote('')
    setStaffList([])
    setLoading(false)
    router.push('/manager/historique')
  }

  return (
    <div className="section">
      {/* LIVE BAR */}
      <div className="live-bar">
        <div className="live-cell">
          <div className="live-cell-lbl">Ticket moy.</div>
          <div className="live-cell-val" style={{ color: 'var(--blue)' }}>
            {caNum && covNum ? fmt(ticket) + '€' : '—'}
          </div>
        </div>
        <div className="live-cell">
          <div className="live-cell-lbl">Co. prod</div>
          <div className="live-cell-val" style={{ color: caNum && totalStaffHours ? coprodColor(cp) : 'var(--sub)' }}>
            {caNum && totalStaffHours ? coprodLabel(cp) : '—'}
          </div>
        </div>
      </div>

      {/* HORAIRES */}
      <div className="sec-label">Horaires</div>
      <div className="icard" style={{ marginBottom: 10 }}>
        <div className="icard-grid">
          <div className="ifield"><label>Ouverture</label><input type="text" value={ouv} onChange={e => setOuv(e.target.value)} placeholder="10h00" /></div>
          <div className="icard-dv" />
          <div className="ifield"><label>Fermeture</label><input type="text" value={ferm} onChange={e => setFerm(e.target.value)} placeholder="01h30" /></div>
        </div>
      </div>

      {/* CHIFFRES */}
      <div className="sec-label">Chiffres</div>
      <div className="icard" style={{ marginBottom: 10 }}>
        <div className="icard-grid">
          <div className="ifield"><label>CA HT €</label><input type="number" value={ca} onChange={e => setCa(e.target.value)} placeholder="0" inputMode="decimal" /></div>
          <div className="icard-dv" />
          <div className="ifield"><label>Couverts</label><input type="number" value={cov} onChange={e => setCov(e.target.value)} placeholder="0" inputMode="numeric" /></div>
        </div>
        <div className="icard-dh" />
        <div className="icard-grid">
          <div className="ifield"><label>Offerts €</label><input type="number" value={offerts} onChange={e => setOfferts(e.target.value)} placeholder="0" inputMode="decimal" /></div>
          <div className="icard-dv" />
          <div className="ifield"><label>Annulations €</label><input type="number" value={annul} onChange={e => setAnnul(e.target.value)} placeholder="0" inputMode="decimal" /></div>
        </div>
      </div>

      {/* PERSONNEL */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div className="sec-label" style={{ marginBottom: 0 }}>Personnel</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ fontSize: 11, color: 'var(--sub)' }}>{minToStr(totalStaffMinutes)} total</div>
          <button onClick={addStaff} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--accent)', border: 'none', borderRadius: 100, color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 700, padding: '7px 14px' }}>
            + Ajouter
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
        {staffList.length === 0
          ? <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--dim)', fontSize: 13 }}>Tape sur + Ajouter pour chaque employé</div>
          : staffList.map(s => (
            <StaffRow key={s.id} staff={s} onChange={u => updateStaff(s.id, u)} onDelete={() => removeStaff(s.id)} />
          ))
        }
      </div>

      {/* REMARQUE */}
      <div className="sec-label">Remarque</div>
      <div className="icard" style={{ marginBottom: 12 }}>
        <div className="ifield text" style={{ padding: '18px 16px' }}>
          <input type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="R.a.s — ou décris l'ambiance, incidents…" />
        </div>
      </div>

      <button className="btn-main" onClick={submit} disabled={loading}>
        {loading ? 'Envoi…' : 'Valider la RAZ'}
      </button>
    </div>
  )
}
