'use client'
import { useState } from 'react'
import { calcRentabiliteWithSettings, fmt, isoToday } from '@/lib/calculations'
import { useSettings } from '@/lib/useSettings'
import type { AppSettings } from '@/lib/settings'
import { ProfitChart } from '@/components/ProfitChart'
import { HistoSection } from '@/components/directeur/HistoSection'
import type { RazEntry } from '@/lib/supabase/types'

type Period = '1J' | '7J' | '30J'

function cutoffFor(period: Period): string {
  const d = new Date()
  if (period === '1J') d.setDate(d.getDate() - 1)
  else if (period === '7J') d.setDate(d.getDate() - 7)
  else d.setDate(d.getDate() - 30)
  return d.toISOString().split('T')[0]
}

function insight(entries: RazEntry[], settings: AppSettings): string {
  if (entries.length < 2) return ''
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date))
  const profits = sorted.map(e => calcRentabiliteWithSettings(e.ca, e.staff_hours, settings).profit)
  const mid = Math.floor(profits.length / 2)
  const firstHalf = profits.slice(0, mid)
  const secondHalf = profits.slice(mid)
  const avg = (arr: number[]) => arr.reduce((s, v) => s + v, 0) / arr.length
  const a1 = avg(firstHalf)
  const a2 = avg(secondHalf)
  const diff = a2 - a1
  const threshold = Math.max(30, Math.abs(a1) * 0.08)
  if (diff > threshold) return '📈 Amélioration'
  if (diff < -threshold) return '📉 Performance en baisse'
  return '→ Stable'
}

interface Props {
  entries: RazEntry[]
}

export function RestoPeriodView({ entries }: Props) {
  const { settings } = useSettings()
  const [period, setPeriod] = useState<Period>('7J')

  const cutoff = cutoffFor(period)
  const filtered = period === '1J'
    ? entries.filter(e => e.date === isoToday())
    : entries.filter(e => e.date >= cutoff)

  let totalCA = 0, totalProfit = 0
  filtered.forEach(e => {
    const r = calcRentabiliteWithSettings(e.ca, e.staff_hours, settings)
    totalCA += e.ca
    totalProfit += r.profit
  })
  const avgCA = filtered.length > 0 ? totalCA / filtered.length : 0
  const avgProfit = filtered.length > 0 ? totalProfit / filtered.length : 0
  const avgMarge = totalCA > 0 ? (totalProfit / totalCA) * 100 : 0
  const insightText = insight(filtered, settings)

  return (
    <div>
      {/* Period toggle */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {(['1J', '7J', '30J'] as Period[]).map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            style={{
              flex: 1, padding: '8px 0', borderRadius: 10,
              fontSize: 12, fontWeight: 700, cursor: 'pointer',
              border: period === p ? '1px solid var(--accent)' : '1px solid var(--line2)',
              background: period === p ? 'var(--accent)' : 'var(--card)',
              color: period === p ? '#fff' : 'var(--sub)',
              transition: 'all 0.15s',
            }}
          >
            {p}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ color: 'var(--dim)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>
          Aucun service sur cette période
        </div>
      ) : (
        <>
          {/* KPI moyens */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
            <div style={{ background: 'var(--card)', border: '1px solid var(--line2)', borderRadius: 12, padding: '12px 10px', textAlign: 'center' }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--dim)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>CA moy.</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>{fmt(avgCA)}€</div>
            </div>
            <div style={{ background: 'var(--card)', border: '1px solid var(--line2)', borderRadius: 12, padding: '12px 10px', textAlign: 'center' }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--dim)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Profit moy.</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: avgProfit >= 0 ? 'var(--green)' : 'var(--red)' }}>
                {avgProfit >= 0 ? '+' : ''}{fmt(avgProfit)}€
              </div>
            </div>
            <div style={{ background: 'var(--card)', border: '1px solid var(--line2)', borderRadius: 12, padding: '12px 10px', textAlign: 'center' }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--dim)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Marge moy.</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: avgMarge >= 0 ? 'var(--green)' : 'var(--red)' }}>
                {avgMarge.toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Insight */}
          {insightText && (
            <div style={{
              textAlign: 'center', fontSize: 13, fontWeight: 600,
              color: 'var(--sub)', marginBottom: 14,
              padding: '8px 16px', background: 'var(--card)',
              border: '1px solid var(--line2)', borderRadius: 10,
            }}>
              {insightText}
            </div>
          )}

          {/* Chart */}
          {filtered.length >= 2 && (
            <div style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid var(--line2)',
              borderRadius: 14, padding: '14px 10px 8px', marginBottom: 14,
            }}>
              <ProfitChart key={period} entries={filtered} />
            </div>
          )}

          {/* Historique */}
          <HistoSection entries={filtered} />
        </>
      )}
    </div>
  )
}
