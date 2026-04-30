'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/components/Toast'
import type { Restaurant } from '@/lib/supabase/types'

interface Props {
  restaurants: Restaurant[]
}

export function ImportForm({ restaurants }: Props) {
  const router = useRouter()
  const [restoId, setRestoId] = useState(restaurants[0]?.id ?? '')
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  const [ca, setCa] = useState('')
  const [heures, setHeures] = useState('')
  const [couverts, setCouverts] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [csv, setCsv] = useState('')
  const [showCsv, setShowCsv] = useState(false)

  async function handleManual() {
    const caNum = parseFloat(ca)
    const hNum = parseFloat(heures)
    const covNum = parseInt(couverts) || 0
    if (!restoId) { toast('⚠ Sélectionne un restaurant'); return }
    if (!date) { toast('⚠ Date requise'); return }
    if (isNaN(caNum) || caNum <= 0) { toast('⚠ CA invalide'); return }
    if (isNaN(hNum) || hNum <= 0) { toast('⚠ Heures invalides'); return }

    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('raz_entries').upsert({
      restaurant_id: restoId,
      date,
      ca: caNum,
      staff_hours: hNum,
      couverts: covNum,
      offerts: 0,
      annulations: 0,
      note: note.trim(),
    }, { onConflict: 'restaurant_id,date' })

    if (error) { toast('⚠ ' + error.message); setLoading(false); return }
    toast('RAZ importée ✓')
    setCa(''); setHeures(''); setCouverts(''); setNote('')
    setLoading(false)
    router.refresh()
  }

  async function handleCsv() {
    if (!restoId) { toast('⚠ Sélectionne un restaurant'); return }
    const rows = csv.trim().split('\n').map(l => l.split(',').map(s => s.trim()))
    const entries = rows.map(r => ({
      restaurant_id: restoId,
      date: r[0],
      ca: parseFloat(r[1]),
      staff_hours: parseFloat(r[2]),
      couverts: parseInt(r[3]) || 0,
      offerts: 0, annulations: 0, note: '',
    })).filter(e => e.date && !isNaN(e.ca) && !isNaN(e.staff_hours))

    if (!entries.length) { toast('⚠ Aucune ligne valide'); return }
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('raz_entries').upsert(entries, { onConflict: 'restaurant_id,date' })

    if (error) { toast('⚠ ' + error.message); setLoading(false); return }
    toast(`${entries.length} RAZ importée(s) ✓`)
    setCsv('')
    setLoading(false)
    router.refresh()
  }

  return (
    <>
      <div className="field">
        <label>Restaurant</label>
        <select value={restoId} onChange={e => setRestoId(e.target.value)}
          style={{ background: 'var(--input)', border: '1px solid var(--border)', borderRadius: 10, padding: '11px 14px', color: 'var(--text)', fontSize: 14, width: '100%' }}>
          {restaurants.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button className={!showCsv ? 'btn-main' : 'btn-ghost'} style={{ flex: 1, fontSize: 13 }} onClick={() => setShowCsv(false)}>Saisie manuelle</button>
        <button className={showCsv ? 'btn-main' : 'btn-ghost'} style={{ flex: 1, fontSize: 13 }} onClick={() => setShowCsv(true)}>CSV</button>
      </div>

      {!showCsv ? (
        <>
          <div className="field">
            <label>Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div className="field">
            <label>CA HT (€)</label>
            <input type="number" value={ca} onChange={e => setCa(e.target.value)} placeholder="1200" step={0.01} />
          </div>
          <div className="field">
            <label>Heures staff</label>
            <input type="number" value={heures} onChange={e => setHeures(e.target.value)} placeholder="18.5" step={0.5} />
          </div>
          <div className="field">
            <label>Couverts</label>
            <input type="number" value={couverts} onChange={e => setCouverts(e.target.value)} placeholder="45" />
          </div>
          <div className="field">
            <label>Note (optionnel)</label>
            <input type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="Service du midi" />
          </div>
          <button className="btn-main" onClick={handleManual} disabled={loading}>
            {loading ? 'Importation…' : 'Importer ce service'}
          </button>
        </>
      ) : (
        <>
          <div className="field">
            <label>Format : date,ca,heures,couverts (une ligne par service)</label>
            <textarea
              value={csv}
              onChange={e => setCsv(e.target.value)}
              placeholder={'2025-04-28,1250.00,18.5,42\n2025-04-27,980.00,15.0,35'}
              rows={6}
              style={{
                background: 'var(--input)', border: '1px solid var(--border)',
                borderRadius: 10, padding: '11px 14px', color: 'var(--text)',
                fontSize: 13, width: '100%', fontFamily: 'monospace', resize: 'vertical',
              }}
            />
          </div>
          <button className="btn-main" onClick={handleCsv} disabled={loading}>
            {loading ? 'Importation…' : 'Importer le CSV'}
          </button>
        </>
      )}
    </>
  )
}
