'use client'
import { motion } from 'framer-motion'
import { useSettings } from '@/lib/useSettings'
import { calcRentabiliteWithSettings, fmt, dateStr } from '@/lib/calculations'
import type { RazEntry } from '@/lib/supabase/types'

const W = 340, H = 140, PL = 42, PR = 12, PT = 12, PB = 28
const CW = W - PL - PR
const CH = H - PT - PB

export function ProfitChart({ entries }: { entries: RazEntry[] }) {
  const { settings } = useSettings()

  const data = [...entries]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(e => {
      const r = calcRentabiliteWithSettings(e.ca, e.staff_hours, settings)
      return r.statut !== 'vide' ? { date: e.date, profit: r.profit } : null
    })
    .filter((d): d is { date: string; profit: number } => d !== null)

  if (data.length < 2) return null

  const profits = data.map(d => d.profit)
  const maxP = Math.max(...profits, 1)
  const minP = Math.min(...profits, 0)
  const range = maxP - minP || 1
  const n = data.length

  const toX = (i: number) => PL + (i / (n - 1)) * CW
  const toY = (p: number) => PT + (1 - (p - minP) / range) * CH
  const zeroY = toY(0)

  const pathD = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${toX(i).toFixed(1)} ${toY(d.profit).toFixed(1)}`).join(' ')
  const areaD = `${pathD} L ${toX(n - 1).toFixed(1)} ${zeroY.toFixed(1)} L ${PL.toFixed(1)} ${zeroY.toFixed(1)} Z`

  const lastProfit = profits[n - 1]
  const lineColor = lastProfit >= 0 ? 'var(--green)' : 'var(--red)'
  const areaColor = lastProfit >= 0 ? 'rgba(29,233,160,0.07)' : 'rgba(255,91,91,0.07)'

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%' }}>
      {/* Horizontal grid */}
      {[0.25, 0.5, 0.75].map(t => (
        <line key={t} x1={PL} y1={PT + t * CH} x2={W - PR} y2={PT + t * CH}
          stroke="rgba(255,255,255,0.04)" strokeWidth={1} />
      ))}

      {/* Zero line */}
      {zeroY > PT + 4 && zeroY < H - PB - 4 && (
        <line x1={PL} y1={zeroY} x2={W - PR} y2={zeroY}
          stroke="rgba(255,255,255,0.15)" strokeWidth={1} strokeDasharray="4 3" />
      )}

      {/* Area fill */}
      <motion.path d={areaD} fill={areaColor}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.4 }} />

      {/* Line */}
      <motion.path d={pathD}
        stroke={lineColor} strokeWidth={2} fill="none"
        strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ duration: 1.2, ease: 'easeInOut' }} />

      {/* Dots */}
      {data.map((d, i) => (
        <circle key={i} cx={toX(i)} cy={toY(d.profit)} r={2.5}
          fill={d.profit >= 0 ? 'var(--green)' : 'var(--red)'} />
      ))}

      {/* Y labels */}
      <text x={PL - 4} y={PT + 5} textAnchor="end" fontSize={9} fill="var(--dim)">{fmt(maxP)}€</text>
      {minP < -1 && (
        <text x={PL - 4} y={H - PB + 2} textAnchor="end" fontSize={9} fill="var(--dim)">{fmt(minP)}€</text>
      )}
      {zeroY > PT + 14 && zeroY < H - PB - 6 && (
        <text x={PL - 4} y={zeroY + 4} textAnchor="end" fontSize={8} fill="rgba(255,255,255,0.2)">0</text>
      )}

      {/* X labels */}
      <text x={PL} y={H - 4} textAnchor="start" fontSize={9} fill="var(--dim)">{dateStr(data[0].date)}</text>
      <text x={W - PR} y={H - 4} textAnchor="end" fontSize={9} fill="var(--dim)">{dateStr(data[n - 1].date)}</text>
    </svg>
  )
}
