import { fmt, ticketMoyen, coprod, coprodColor, coprodLabel, dateStr, minToStr } from '@/lib/calculations'
import type { RazWithStaff } from '@/lib/supabase/types'

export function HistoList({ entries }: { entries: RazWithStaff[] }) {
  if (!entries.length) {
    return (
      <div className="empty">
        <div className="empty-ico">≡</div>
        <div className="empty-txt">Aucune RAZ enregistrée.<br />Commence ce soir.</div>
      </div>
    )
  }

  return (
    <div className="histo-wrap">
      {entries.map(e => {
        const t = ticketMoyen(e.ca, e.couverts)
        const c = coprod(e.staff_hours, e.ca)
        return (
          <div key={e.id} className="histo-row up">
            <div>
              <div className="hr-date">
                {dateStr(e.date)}{e.ouverture ? ` · ${e.ouverture}→${e.fermeture}` : ''}
              </div>
              <div className="hr-note">{e.note}</div>
              {e.staff_entries.length > 0 && (
                <div style={{ fontSize: 11, color: 'var(--dim)', marginTop: 6, lineHeight: 1.8 }}>
                  {e.staff_entries.filter(s => s.nom || s.debut).map(s => (
                    <span key={s.id} style={{ marginRight: 8 }}>
                      {s.nom || '—'} {s.debut}→{s.fin}
                      {s.pause_minutes ? ` (-${s.pause_minutes}min)` : ''} = <strong style={{ color: 'var(--sub)' }}>{minToStr(s.duree_minutes)}</strong>
                      <br />
                    </span>
                  ))}
                </div>
              )}
              {e.offerts > 0 && (
                <div style={{ fontSize: 11, color: 'var(--sub)', marginTop: 4 }}>
                  Offerts {fmt(e.offerts)}€{e.annulations > 0 ? ` · Annul. ${fmt(e.annulations)}€` : ''}
                </div>
              )}
            </div>
            <div className="hr-kpis">
              <div className="hr-k">
                <div className="hr-k-val" style={{ color: 'var(--text)' }}>{fmt(e.ca)}€</div>
                <div className="hr-k-lbl">CA</div>
              </div>
              <div className="hr-k">
                <div className="hr-k-val" style={{ color: 'var(--blue)' }}>{fmt(t)}€</div>
                <div className="hr-k-lbl">Tick.</div>
              </div>
              <div className="hr-k">
                <div className="hr-k-val" style={{ color: coprodColor(c) }}>{coprodLabel(c)}</div>
                <div className="hr-k-lbl">C.P</div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
