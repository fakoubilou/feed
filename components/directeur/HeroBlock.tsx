'use client'
import { useState } from 'react'
import {
  fmt, ticketMoyen, coprod, coprodLabel, coprodColor, isoToday,
  calcRentabiliteWithSettings, STATUT_CONFIG,
} from '@/lib/calculations'
import { useSettings } from '@/lib/useSettings'
import { Gauge } from '@/components/Gauge'
import type { Restaurant, RazEntry } from '@/lib/supabase/types'

interface Props {
  restaurants: Restaurant[]
  latestRaz: Record<string, RazEntry | undefined>
}

export function HeroBlock({ restaurants, latestRaz }: Props) {
  const { settings } = useSettings()
  const today = isoToday()
  const [showPicker, setShowPicker] = useState(false)

  let totalCA = 0, totalCov = 0, totalStaffH = 0, restosDone = 0
  restaurants.forEach(r => {
    const last = latestRaz[r.id]
    if (last && last.date === today) {
      totalCA += last.ca
      totalCov += last.couverts
      totalStaffH += last.staff_hours
      restosDone++
    }
  })

  const rent = totalCA > 0 ? calcRentabiliteWithSettings(totalCA, totalStaffH, settings) : null
  const cfg = rent ? STATUT_CONFIG[rent.statut] : null
  const cp = coprod(totalStaffH, totalCA)
  const ticket = ticketMoyen(totalCA, totalCov)
  const sign = rent && rent.profit >= 0 ? '+' : ''
  const foodCostPct = Math.round(settings.food_cost * 100)
  const foodCostColor = foodCostPct < 30 ? 'var(--green)' : foodCostPct <= 35 ? 'var(--orange)' : 'var(--red)'

  return (
    <>
      <div className="hero-block" style={{ width: '100%', maxWidth: 420, margin: '0 auto', padding: '0 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        {/* Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginBottom: 16, width: '100%', maxWidth: 360 }}>
          <div className="hero-label">Aujourd&apos;hui</div>
          <button onClick={() => setShowPicker(true)} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 100, padding: '6px 12px',
            fontSize: 12, fontWeight: 700, color: 'var(--sub)', cursor: 'pointer',
            margin: '0 auto',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: restosDone > 0 ? 'var(--green)' : 'var(--dim)', display: 'inline-block' }} />
            {restosDone}/{restaurants.length} restos ›
          </button>
        </div>

        {/* 1. CA */}
        <div style={{ marginBottom: 4, textAlign: 'center', width: '100%', maxWidth: 360 }}>
          <div className="hero-ca" style={{ margin: '0 auto', textAlign: 'center' }}>
            {totalCA > 0 ? fmt(totalCA) : '—'}<span> €</span>
          </div>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--sub)', letterSpacing: '0.08em', marginTop: 4 }}>
            CA HT aujourd&apos;hui
          </div>
        </div>

        {/* 2. Profit */}
        {rent && rent.statut !== 'vide' && (
          <div style={{ textAlign: 'center', marginTop: 10, marginBottom: 4 }}>
            <div style={{ fontSize: 36, fontWeight: 800, color: cfg!.color, letterSpacing: '-0.02em', lineHeight: 1 }}>
              {sign}{fmt(rent.profit)}€
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--sub)', letterSpacing: '0.08em', marginTop: 4 }}>
              Profit estimé
            </div>
          </div>
        )}

        {/* 3. Gauge */}
        {rent && rent.statut !== 'vide' && (
          <div style={{ width: '100%', maxWidth: 360, display: 'flex', justifyContent: 'center', margin: '4px 0' }}>
            <Gauge
              marge={rent.marge}
              margeFaible={settings.marge_faible}
              margeBonne={settings.marge_bonne}
              maxWidth={140}
            />
          </div>
        )}

        {/* 4. Statut + Explication */}
        {cfg && rent && rent.statut !== 'vide' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, marginBottom: 14 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: cfg.bg, border: `1px solid ${cfg.border}`,
              borderRadius: 100, padding: '4px 12px',
              fontSize: 11, fontWeight: 700, color: cfg.color,
            }}>
              {cfg.emoji} {cfg.label} · {rent.marge.toFixed(1)}%
            </div>
            {rent.explication && <div style={{ fontSize: 12, color: 'var(--sub)', textAlign: 'center' }}>{rent.explication}</div>}
          </div>
        )}

        {/* Secondary KPIs */}
        {totalCA > 0 && (
          <div style={{
            display: 'flex', width: '100%', maxWidth: 360,
            borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 14, marginTop: 4,
          }}>
            <div style={{ flex: 1, textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: coprodColor(cp), letterSpacing: '-0.01em', lineHeight: 1 }}>{coprodLabel(cp)}</div>
              <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--dim)', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 4 }}>Co. prod</div>
            </div>
            <div style={{ flex: 1, textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--blue)', letterSpacing: '-0.01em', lineHeight: 1 }}>{totalCov > 0 ? `${fmt(ticket)}€` : '—'}</div>
              <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--dim)', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 4 }}>Ticket moyen</div>
            </div>
            <div style={{ flex: 1, textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: foodCostColor, letterSpacing: '-0.01em', lineHeight: 1 }}>{foodCostPct}%</div>
              <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--dim)', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 4 }}>Food cost</div>
            </div>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--blue)', letterSpacing: '-0.01em', lineHeight: 1 }}>{totalCov > 0 ? totalCov : '—'}</div>
              <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--dim)', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 4 }}>Couverts</div>
            </div>
          </div>
        )}
      </div>

      {/* Restaurant picker */}
      {showPicker && (
        <div onClick={() => setShowPicker(false)} style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'flex-end',
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            width: '100%', background: 'var(--surface)',
            borderRadius: '20px 20px 0 0', padding: '20px 20px 40px',
            border: '1px solid var(--line)',
          }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--line2)', margin: '0 auto 20px' }} />
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--sub)', marginBottom: 12, letterSpacing: '0.06em' }}>
              RESTAURANTS
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {restaurants.map(r => {
                const last = latestRaz[r.id]
                const hasToday = !!last && last.date === today
                const rRent = last ? calcRentabiliteWithSettings(last.ca, last.staff_hours, settings) : null
                const rCfg = rRent ? STATUT_CONFIG[rRent.statut] : null
                return (
                  <a key={r.id} href={`/directeur/resto/${r.id}`} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 14px', borderRadius: 12,
                    background: 'var(--card)', border: '1px solid var(--line2)', textDecoration: 'none',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: !last ? 'var(--dim)' : hasToday ? 'var(--green)' : 'var(--orange)', flexShrink: 0 }} />
                      <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{r.name}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {rRent && rRent.statut !== 'vide' && rCfg && (
                        <span style={{ fontSize: 12, fontWeight: 700, color: rCfg.color }}>
                          {rRent.profit >= 0 ? '+' : ''}{fmt(rRent.profit)}€ · {rRent.marge.toFixed(1)}%
                        </span>
                      )}
                      <span style={{ color: 'var(--dim)', fontSize: 16 }}>›</span>
                    </div>
                  </a>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
