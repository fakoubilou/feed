'use client'
import { useRouter } from 'next/navigation'
import { fmt, isoToday, calcRentabiliteWithSettings, STATUT_CONFIG } from '@/lib/calculations'
import { useSettings } from '@/lib/useSettings'
import type { Restaurant, RazEntry } from '@/lib/supabase/types'

const STATUT_ORDER = { risque: 0, moyen: 1, rentable: 2, vide: 3 } as const

interface Props {
  restaurants: Restaurant[]
  latestRaz: Record<string, RazEntry | undefined>
}

export function RestoList({ restaurants, latestRaz }: Props) {
  const router = useRouter()
  const { settings } = useSettings()
  const today = isoToday()

  if (!restaurants.length) {
    return <div className="empty"><div className="empty-ico">⊞</div><div className="empty-txt">Aucun restaurant.</div></div>
  }

  const withRent = restaurants.map(r => {
    const last = latestRaz[r.id]
    const rent = last ? calcRentabiliteWithSettings(last.ca, last.staff_hours, settings) : null
    return { r, last, rent }
  })

  const sorted = [...withRent].sort((a, b) =>
    STATUT_ORDER[a.rent?.statut ?? 'vide'] - STATUT_ORDER[b.rent?.statut ?? 'vide']
  )

  return (
    <div className="card-list">
      {sorted.map(({ r, last, rent }) => {
        const hasToday = !!last && last.date === today
        const cfg = rent ? STATUT_CONFIG[rent.statut] : STATUT_CONFIG.vide
        const sign = rent && rent.profit >= 0 ? '+' : ''

        return (
          <div key={r.id} className="list-row up" onClick={() => router.push(`/directeur/resto/${r.id}`)}>
            <div className="row-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 13 }}>{cfg.emoji}</span>
                <div className="row-name" style={{ marginBottom: 0 }}>{r.name}</div>
                <span style={{
                  width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                  background: !last ? 'var(--dim)' : hasToday ? 'var(--green)' : 'var(--orange)',
                }} />
              </div>
              {rent && rent.statut !== 'vide' ? (
                <div style={{ fontSize: 13, fontWeight: 700, color: cfg.color }}>
                  {sign}{fmt(rent.profit)}€ <span style={{ opacity: 0.7 }}>· {rent.marge.toFixed(1)}%</span>
                </div>
              ) : (
                <div style={{ fontSize: 12, color: 'var(--dim)' }}>Aucune donnée</div>
              )}
            </div>
            <div className="row-arrow">›</div>
          </div>
        )
      })}
    </div>
  )
}
