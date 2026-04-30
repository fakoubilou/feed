import type { ReactNode } from 'react'
import { coprod, coprodLabel, isoToday } from '@/lib/calculations'
import type { Restaurant, RazEntry } from '@/lib/supabase/types'

interface Props {
  restaurants: Restaurant[]
  latestRaz: Record<string, RazEntry | undefined>
}

export function AlertsZone({ restaurants, latestRaz }: Props) {
  const today = isoToday()
  const alerts: { type: 'orange' | 'red' | 'gray'; icon: string; msg: ReactNode }[] = []

  restaurants.forEach(r => {
    const last = latestRaz[r.id]
    if (!last) {
      alerts.push({ type: 'gray', icon: '○', msg: <><strong>{r.name}</strong> — Aucune RAZ</> })
      return
    }
    if (last.date !== today) {
      alerts.push({ type: 'orange', icon: '◐', msg: <><strong>{r.name}</strong> — RAZ non transmise aujourd&apos;hui</> })
    }
    const c = coprod(last.staff_hours, last.ca)
    if (c < 40) {
      alerts.push({ type: 'red', icon: '●', msg: <><strong>{r.name}</strong> — Co. prod {coprodLabel(c)}, hors seuil</> })
    }
  })

  if (!alerts.length) return null

  return (
    <div className="alerts-wrap">
      {alerts.map((a, i) => (
        <div key={i} className={`alert-pill ${a.type}`}>
          <span>{a.icon}</span>
          <span>{a.msg}</span>
        </div>
      ))}
    </div>
  )
}
