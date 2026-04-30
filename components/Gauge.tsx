'use client'
import { useEffect } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'

const CX = 100, CY = 95, R = 78, TRACK = 13, NEEDLE_R = 62, GAUGE_MAX = 40

function pctToAngle(v: number) {
  return Math.PI - (v / GAUGE_MAX) * Math.PI
}

function pctToXY(v: number): [number, number] {
  const a = pctToAngle(v)
  return [CX + R * Math.cos(a), CY - R * Math.sin(a)]
}

function arc(from: number, to: number): string {
  const [x1, y1] = pctToXY(from)
  const [x2, y2] = pctToXY(to)
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${R} ${R} 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`
}

interface Props {
  marge: number
  margeFaible?: number
  margeBonne?: number
  maxWidth?: number
}

export function Gauge({ marge, margeFaible = 10, margeBonne = 20, maxWidth = 260 }: Props) {
  const clamped = Math.min(Math.max(marge, 0), GAUGE_MAX)
  const spring = useSpring(0, { stiffness: 70, damping: 20 })

  useEffect(() => {
    spring.set(clamped)
  }, [clamped, spring])

  const nx = useTransform(spring, v => CX + NEEDLE_R * Math.cos(pctToAngle(v)))
  const ny = useTransform(spring, v => CY - NEEDLE_R * Math.sin(pctToAngle(v)))

  const [lx, ly] = pctToXY(0)
  const [rx, ry] = pctToXY(GAUGE_MAX)

  const mf = Math.max(0, Math.min(margeFaible, GAUGE_MAX))
  const mb = Math.max(mf, Math.min(margeBonne, GAUGE_MAX))

  return (
    <svg viewBox="0 0 200 118" style={{ width: '100%', maxWidth }}>
      {/* Background track */}
      <path
        d={`M ${lx.toFixed(2)} ${ly.toFixed(2)} A ${R} ${R} 0 0 1 ${CX} ${(CY - R).toFixed(2)} A ${R} ${R} 0 0 1 ${rx.toFixed(2)} ${ry.toFixed(2)}`}
        fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={TRACK} strokeLinecap="round"
      />

      {/* Red zone */}
      {mf > 0 && (
        <path d={arc(0, mf)} fill="none" stroke="var(--red)" strokeWidth={TRACK} strokeLinecap="butt" opacity={0.75} />
      )}

      {/* Orange zone */}
      {mb > mf && (
        <path d={arc(mf, mb)} fill="none" stroke="var(--orange)" strokeWidth={TRACK} strokeLinecap="butt" opacity={0.75} />
      )}

      {/* Green zone */}
      {GAUGE_MAX > mb && (
        <path d={arc(mb, GAUGE_MAX)} fill="none" stroke="var(--green)" strokeWidth={TRACK} strokeLinecap="butt" opacity={0.75} />
      )}

      {/* Round end caps */}
      <circle cx={lx} cy={ly} r={TRACK / 2} fill="var(--red)" opacity={0.75} />
      <circle cx={rx} cy={ry} r={TRACK / 2} fill="var(--green)" opacity={0.75} />

      {/* Needle */}
      <motion.line
        x1={CX} y1={CY}
        x2={nx} y2={ny}
        stroke="white" strokeWidth={2.5} strokeLinecap="round"
        style={{ filter: 'drop-shadow(0 0 3px rgba(255,255,255,0.4))' }}
      />

      {/* Hub */}
      <circle cx={CX} cy={CY} r={6} fill="white" />
      <circle cx={CX} cy={CY} r={3.5} fill="var(--card, #1a1a2e)" />

      {/* Marge label */}
      <text
        x={CX} y={CY + 20}
        textAnchor="middle" dominantBaseline="middle"
        fontSize={14} fontWeight={700} fill="var(--sub)"
      >
        {marge.toFixed(1)}%
      </text>
      <text
        x={CX} y={CY + 34}
        textAnchor="middle" dominantBaseline="middle"
        fontSize={9} fontWeight={600} fill="var(--dim)" letterSpacing="0.08em"
      >
        MARGE
      </text>

      {/* Zone labels */}
      <text x={12} y={CY + 18} fontSize={8} fill="var(--red)" fontWeight={600} opacity={0.8}>0%</text>
      <text x={178} y={CY + 18} fontSize={8} fill="var(--green)" fontWeight={600} opacity={0.8} textAnchor="end">40%</text>
    </svg>
  )
}
