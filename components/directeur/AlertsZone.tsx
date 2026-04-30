'use client'
import type { ReactNode } from 'react'
import { coprod, coprodLabel, isoToday, calcRentabiliteWithSettings, STATUT_CONFIG } from '@/lib/calculations'
import { useSettings } from '@/lib/useSettings'
import type { Restaurant, RazEntry } from '@/lib/supabase/types'

interface Props {
  restaurants: Restaurant[]
  latestRaz: Record<string, RazEntry | undefined>
}

export function AlertsZone({ restaurants, latestRaz }: Props) {
  const { settings } = useSettings()
  const today = isoToday()
  const alerts: { type: 'orange' | 'red' | 'gray' | 'green'; icon: string; msg: ReactNode }[] = []

  restaurants.forEach(r => {
    const last = latestRaz[r.id]
    if (!last) {
      alerts.push({ type: 'gray', icon: '○', msg: <><strong>{r.name}</strong> — Aucune RAZ</> })
      return
    }
    if (last.date !== today) {
      alerts.push({ type: 'orange', icon: '◐', msg: <><strong>{r.name}</strong> — RAZ non transmise aujourd&apos;hui</> })
    }
    const rent = calcRentabiliteWithSettings(last.ca, last.staff_hours, settings)
    if (rent.statut === 'risque') {
      alerts.push({
        type: 'red', icon: '●',
        msg: <><strong>{r.name}</strong> — {STATUT_CONFIG.risque.emoji} À risque · marge {rent.marge.toFixed(1)}%</>,
      })
    } else if (rent.statut === 'moyen') {
      const c = coprod(last.staff_hours, last.ca)
      if (c < 40) alerts.push({
        type: 'orange', icon: '◑',
        msg: <><strong>{r.name}</strong> — {STATUT_CONFIG.moyen.emoji} Moyen · co.prod {coprodLabel(c)}</>,
      })
    } else if (rent.statut === 'rentable' && last.date === today) {
      alerts.push({
        type: 'green', icon: '●',
        msg: <><strong>{r.name}</strong> — {STATUT_CONFIG.rentable.emoji} Rentable · marge {rent.marge.toFixed(1)}%</>,
      })
    }
  })

  if (!alerts.length) return null

  return (
    <div className="alerts-wrap">
      {alerts.map((a, i) => (
        <div key={i}
          className={a.type !== 'green' ? `alert-pill ${a.type === 'red' ? 'red' : a.type === 'gray' ? 'gray' : 'orange'}` : undefined}
          style={a.type === 'green' ? {
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '12px 16px', borderRadius: 12,
            fontSize: 12, fontWeight: 500, lineHeight: 1.4,
            background: 'rgba(29,233,160,0.08)',
            border: '1px solid rgba(29,233,160,0.18)',
            color: 'var(--green)',
          } : undefined}
        >
          <span>{a.icon}</span>
          <span>{a.msg}</span>
        </div>
      ))}
    </div>
  )
}
