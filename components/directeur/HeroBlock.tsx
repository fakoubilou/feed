import { fmt, ticketMoyen, coprod, coprodColor, coprodLabel, isoToday } from '@/lib/calculations'
import type { Restaurant, RazEntry } from '@/lib/supabase/types'

interface Props {
  restaurants: Restaurant[]
  latestRaz: Record<string, RazEntry | undefined>
}

export function HeroBlock({ restaurants, latestRaz }: Props) {
  const today = isoToday()
  let totalCA = 0, totalCov = 0, totalMS = 0, restosDone = 0

  restaurants.forEach(r => {
    const last = latestRaz[r.id]
    if (last && last.date === today) {
      totalCA += last.ca
      totalCov += last.couverts
      totalMS += last.staff_hours
      restosDone++
    }
  })

  const totalCP = coprod(totalMS, totalCA)
  const totalTicket = ticketMoyen(totalCA, totalCov)

  return (
    <div className="hero-block">
      <div className="hero-label">Aujourd&apos;hui · {restosDone}/{restaurants.length} restos</div>
      <div className="hero-ca">{totalCA > 0 ? fmt(totalCA) : '—'}<span> €</span></div>
      <div className="hero-stats">
        <div className="hero-stat">
          <div className="hero-stat-val" style={{ color: 'var(--blue)' }}>{totalCov > 0 ? fmt(totalTicket) + '€' : '—'}</div>
          <div className="hero-stat-lbl">Ticket moy.</div>
        </div>
        <div className="hero-stat">
          <div className="hero-stat-val" style={{ color: totalCA > 0 ? coprodColor(totalCP) : 'var(--sub)' }}>
            {totalCA > 0 ? coprodLabel(totalCP) : '—'}
          </div>
          <div className="hero-stat-lbl">Co. prod</div>
        </div>
        <div className="hero-stat">
          <div className="hero-stat-val" style={{ color: 'var(--text)' }}>{totalCov > 0 ? totalCov : '—'}</div>
          <div className="hero-stat-lbl">Couverts</div>
        </div>
      </div>
      <div className="hero-restos">
        {restaurants.map(r => {
          const last = latestRaz[r.id]
          const dotColor = !last ? 'var(--dim)' : last.date === today ? 'var(--green)' : 'var(--orange)'
          return (
            <div key={r.id} className="hero-resto-chip">
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: dotColor, display: 'inline-block', flexShrink: 0 }} />
              {r.name}
            </div>
          )
        })}
      </div>
    </div>
  )
}
