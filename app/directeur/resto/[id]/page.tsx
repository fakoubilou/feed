import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Toast } from '@/components/Toast'
import { LogoutButton } from '@/components/LogoutButton'
import { fmt, ticketMoyen, coprod, coprodColor, coprodLabel, dateStr, minToStr } from '@/lib/calculations'
import type { Restaurant, RazWithStaff } from '@/lib/supabase/types'

export default async function RestoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profileRaw } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const profile = profileRaw as { role: string } | null
  if (!profile || profile.role !== 'directeur') redirect('/')

  const { data: restaurantRaw } = await supabase.from('restaurants').select('*').eq('id', id).single()
  const restaurant = restaurantRaw as Restaurant | null
  if (!restaurant) redirect('/directeur')

  const { data: entriesRaw } = await supabase
    .from('raz_entries')
    .select('*, staff_entries(*)')
    .eq('restaurant_id', id)
    .order('date', { ascending: false })
    .limit(30)

  const all = (entriesRaw as RazWithStaff[]) ?? []
  const last = all[0]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <header className="topbar">
        <div className="tb-logo">Feed.</div>
        <div className="tb-right">
          <div className="tb-badge">Directeur</div>
          <LogoutButton />
        </div>
      </header>

      <div className="scroll-area">
        <div className="page-head">
          <a href="/directeur" className="back-btn">
            <span className="back-btn-ico">‹</span>Retour
          </a>
          <div className="page-head-title">{restaurant.name}</div>
          <div className="page-head-sub">Dernière RAZ</div>
        </div>

        <div className="section">
          {last ? (() => {
            const t = ticketMoyen(last.ca, last.couverts)
            const c = coprod(last.staff_hours, last.ca)
            return (
              <div className="kpi-grid">
                <div className="kpi-tile"><div className="kpi-tile-lbl">CA HT</div><div className="kpi-tile-val" style={{ color: 'var(--text)' }}>{fmt(last.ca)}<span className="kpi-tile-unit"> €</span></div></div>
                <div className="kpi-tile"><div className="kpi-tile-lbl">Ticket moyen</div><div className="kpi-tile-val" style={{ color: 'var(--blue)' }}>{fmt(t)}<span className="kpi-tile-unit"> €</span></div></div>
                <div className="kpi-tile"><div className="kpi-tile-lbl">Co. prod</div><div className="kpi-tile-val" style={{ color: coprodColor(c) }}>{coprodLabel(c)}</div></div>
                <div className="kpi-tile"><div className="kpi-tile-lbl">Couverts</div><div className="kpi-tile-val" style={{ color: 'var(--sub)' }}>{last.couverts}</div></div>
                {last.offerts > 0 && (
                  <div className="kpi-tile" style={{ gridColumn: '1 / -1' }}>
                    <div className="kpi-tile-lbl">Offerts personnel</div>
                    <div className="kpi-tile-val" style={{ color: 'var(--orange)', fontSize: 24 }}>
                      {fmt(last.offerts)} €
                      {last.annulations > 0 && <span style={{ fontSize: 14, opacity: 0.6, marginLeft: 12 }}>Annul. {fmt(last.annulations)} €</span>}
                    </div>
                  </div>
                )}
                {last.ouverture && (
                  <div className="kpi-tile" style={{ gridColumn: '1 / -1' }}>
                    <div className="kpi-tile-lbl">Horaires</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--sub)' }}>{last.ouverture} → {last.fermeture}</div>
                  </div>
                )}
                <div className="kpi-tile" style={{ gridColumn: '1 / -1' }}>
                  <div className="kpi-tile-lbl">Remarque</div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--sub)', lineHeight: 1.5 }}>{last.note}</div>
                </div>
              </div>
            )
          })() : (
            <div style={{ color: 'var(--sub)', fontSize: 13, padding: '8px 0' }}>Aucune donnée.</div>
          )}

          <div className="sec-label">Historique</div>
          {!all.length ? (
            <div className="empty"><div className="empty-ico">≡</div><div className="empty-txt">Aucune RAZ.</div></div>
          ) : (
            <div className="histo-wrap">
              {all.map(e => {
                const t = ticketMoyen(e.ca, e.couverts)
                const c = coprod(e.staff_hours, e.ca)
                return (
                  <div key={e.id} className="histo-row">
                    <div>
                      <div className="hr-date">{dateStr(e.date)}</div>
                      <div className="hr-note">{e.note}</div>
                      {e.staff_entries?.length > 0 && (
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
                    </div>
                    <div className="hr-kpis">
                      <div className="hr-k"><div className="hr-k-val" style={{ color: 'var(--text)' }}>{fmt(e.ca)}€</div><div className="hr-k-lbl">CA</div></div>
                      <div className="hr-k"><div className="hr-k-val" style={{ color: 'var(--blue)' }}>{fmt(t)}€</div><div className="hr-k-lbl">Tick.</div></div>
                      <div className="hr-k"><div className="hr-k-val" style={{ color: coprodColor(c) }}>{coprodLabel(c)}</div><div className="hr-k-lbl">C.P</div></div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <nav className="bottom-nav">
        <a href="/directeur" className="bnav-btn active"><span className="bnav-ico">◉</span>Dashboard</a>
        <a href="/directeur/restos" className="bnav-btn"><span className="bnav-ico">⊞</span>Restos</a>
      </nav>
      <Toast />
    </div>
  )
}
