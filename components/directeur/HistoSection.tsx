'use client'
import { useSettings } from '@/lib/useSettings'
import { calcRentabiliteWithSettings, fmt, dateStr } from '@/lib/calculations'
import type { RazEntry } from '@/lib/supabase/types'

export function HistoSection({ entries }: { entries: RazEntry[] }) {
  const { settings } = useSettings()

  if (!entries.length) {
    return (
      <div className="empty">
        <div className="empty-ico">≡</div>
        <div className="empty-txt">Aucune RAZ.</div>
      </div>
    )
  }

  return (
    <div className="histo-wrap">
      {entries.map(e => {
        const r = calcRentabiliteWithSettings(e.ca, e.staff_hours, settings)
        const hasData = r.statut !== 'vide'
        return (
          <div key={e.id} className="histo-row">
            <div>
              <div className="hr-date">{dateStr(e.date)}</div>
              {e.note && e.note !== 'R.a.s' && (
                <div className="hr-note">{e.note}</div>
              )}
            </div>
            <div className="hr-kpis">
              <div className="hr-k">
                <div className="hr-k-val" style={{ color: 'var(--text)' }}>{fmt(e.ca)}€</div>
                <div className="hr-k-lbl">CA</div>
              </div>
              {hasData && (
                <>
                  <div className="hr-k">
                    <div className="hr-k-val" style={{ color: r.profit >= 0 ? 'var(--green)' : 'var(--red)' }}>
                      {r.profit >= 0 ? '+' : ''}{fmt(r.profit)}€
                    </div>
                    <div className="hr-k-lbl">Profit</div>
                  </div>
                  <div className="hr-k">
                    <div className="hr-k-val" style={{ color: r.profit >= 0 ? 'var(--green)' : 'var(--red)' }}>
                      {r.marge.toFixed(1)}%
                    </div>
                    <div className="hr-k-lbl">Marge</div>
                  </div>
                </>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
