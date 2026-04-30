'use client'
import { calcRentabiliteWithSettings, STATUT_CONFIG, fmt } from '@/lib/calculations'
import { useSettings } from '@/lib/useSettings'
import { Gauge } from '@/components/Gauge'

interface Props {
  ca: number
  staffHours: number
  couverts: number
}

export function ProfitBlock({ ca, staffHours, couverts }: Props) {
  const { settings } = useSettings()
  const r = calcRentabiliteWithSettings(ca, staffHours, settings)
  const cfg = STATUT_CONFIG[r.statut]
  const isVide = r.statut === 'vide'
  const sign = r.profit >= 0 ? '+' : ''
  const massePct = !isVide ? Math.round(r.masse_salariale / ca * 100) : 0
  const foodPct = Math.round(settings.food_cost * 100)

  return (
    <div style={{
      background: cfg.bg, border: `1px solid ${cfg.border}`,
      borderRadius: 20, padding: '24px 20px 18px',
      position: 'relative', overflow: 'hidden',
      textAlign: 'center',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 1,
        background: `linear-gradient(90deg, transparent, ${cfg.border}, transparent)`,
      }} />

      {/* 1. CA — blanc pur */}
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--dim)', letterSpacing: '0.12em', marginBottom: 4 }}>
        CA HT
      </div>
      <div style={{ fontSize: 48, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1, color: '#fff', marginBottom: 18 }}>
        {fmt(ca)}€
      </div>

      {/* 2. Profit + Marge */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 28, marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--dim)', letterSpacing: '0.08em', marginBottom: 3 }}>PROFIT</div>
          <div style={{ fontSize: 30, fontWeight: 800, color: cfg.color, letterSpacing: '-0.02em' }}>
            {isVide ? '—' : `${sign}${fmt(r.profit)}€`}
          </div>
        </div>
        <div style={{ width: 1, background: 'rgba(255,255,255,0.08)', alignSelf: 'stretch' }} />
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--dim)', letterSpacing: '0.08em', marginBottom: 3 }}>MARGE</div>
          <div style={{ fontSize: 30, fontWeight: 800, color: cfg.color, letterSpacing: '-0.02em' }}>
            {isVide ? '—' : `${r.marge.toFixed(1)}%`}
          </div>
        </div>
      </div>

      {/* 3. Gauge */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
        <Gauge
          marge={r.marge}
          margeFaible={settings.marge_faible}
          margeBonne={settings.marge_bonne}
          maxWidth={150}
        />
      </div>

      {/* 4. Statut + Explication */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, marginBottom: 16 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          background: 'rgba(0,0,0,0.20)', borderRadius: 100, padding: '5px 14px',
          fontSize: 12, fontWeight: 700, color: cfg.color,
        }}>
          {cfg.emoji} {cfg.label}
        </div>
        {r.explication && (
          <div style={{ fontSize: 12, color: 'var(--sub)', lineHeight: 1.4, maxWidth: 260 }}>
            {r.explication}
          </div>
        )}
      </div>

      {/* 5. Food cost + Masse salariale */}
      {!isVide && (
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8,
          borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 14,
          textAlign: 'left',
        }}>
          <div style={{ background: 'rgba(0,0,0,0.14)', borderRadius: 10, padding: '10px 12px' }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--dim)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Food cost</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>{foodPct}%</div>
            <div style={{ fontSize: 10, color: 'var(--dim)', marginTop: 1 }}>{fmt(r.cout_matiere)}€</div>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.14)', borderRadius: 10, padding: '10px 12px' }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--dim)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Masse sal.</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>{massePct}%</div>
            <div style={{ fontSize: 10, color: 'var(--dim)', marginTop: 1 }}>{fmt(r.masse_salariale)}€</div>
          </div>
        </div>
      )}

      <div style={{ fontSize: 10, color: 'var(--dim)', marginTop: 10, textAlign: 'right' }}>
        Estimé · {settings.taux_horaire}€/h · food cost {foodPct}%
      </div>
    </div>
  )
}
