'use client'
import { useRouter } from 'next/navigation'
import { fmt, ticketMoyen, coprod, coprodColor, coprodLabel, isoToday } from '@/lib/calculations'
import type { Restaurant, RazEntry } from '@/lib/supabase/types'

interface Props {
  restaurants: Restaurant[]
  latestRaz: Record<string, RazEntry | undefined>
}

export function RestoList({ restaurants, latestRaz }: Props) {
  const router = useRouter()
  const today = isoToday()

  if (!restaurants.length) {
    return <div className="empty"><div className="empty-ico">⊞</div><div className="empty-txt">Aucun restaurant.</div></div>
  }

  return (
    <div className="card-list">
      {restaurants.map(r => {
        const last = latestRaz[r.id]
        const hasToday = !!last && last.date === today
        const dc = !last ? 'gray' : hasToday ? 'green' : 'orange'

        if (!last) return (
          <div key={r.id} className="list-row" onClick={() => router.push(`/directeur/resto/${r.id}`)}>
            <span className={`row-dot ${dc}`} />
            <div className="row-body">
              <div className="row-name">{r.name}</div>
              <div style={{ fontSize: 12, color: 'var(--sub)' }}>En attente</div>
            </div>
            <div className="row-arrow">›</div>
          </div>
        )

        const t = ticketMoyen(last.ca, last.couverts)
        const c = coprod(last.staff_hours, last.ca)
        return (
          <div key={r.id} className="list-row up" onClick={() => router.push(`/directeur/resto/${r.id}`)}>
            <span className={`row-dot ${dc}`} />
            <div className="row-body">
              <div className="row-name">{r.name}</div>
              <div className="row-metrics">
                <div><div className="rm-val" style={{ color: 'var(--text)' }}>{fmt(last.ca)}€</div><div className="rm-lbl">CA</div></div>
                <div><div className="rm-val" style={{ color: 'var(--blue)' }}>{fmt(t)}€</div><div className="rm-lbl">Ticket</div></div>
                <div><div className="rm-val" style={{ color: coprodColor(c) }}>{coprodLabel(c)}</div><div className="rm-lbl">Co.prod</div></div>
              </div>
            </div>
            <div className="row-arrow">›</div>
          </div>
        )
      })}
    </div>
  )
}
