import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Toast } from '@/components/Toast'
import { LogoutButton } from '@/components/LogoutButton'
import { ProfitBlock } from '@/components/ProfitBlock'
import { RestoPeriodView } from '@/components/directeur/RestoPeriodView'
import type { Restaurant, RazEntry } from '@/lib/supabase/types'

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
    .select('*')
    .eq('restaurant_id', id)
    .order('date', { ascending: false })
    .limit(30)

  const all = (entriesRaw as RazEntry[]) ?? []
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
          {last ? (
            <ProfitBlock
              ca={last.ca}
              staffHours={last.staff_hours}
              couverts={last.couverts}
            />
          ) : (
            <div style={{ color: 'var(--sub)', fontSize: 13, padding: '8px 0' }}>Aucune donnée.</div>
          )}

          <div className="sec-label" style={{ marginTop: 20, marginBottom: 12 }}>Analyse</div>
          <RestoPeriodView entries={all} />
        </div>
      </div>

      <nav className="bottom-nav">
        <a href="/directeur" className="bnav-btn active"><span className="bnav-ico">◉</span>Dashboard</a>
        <a href="/directeur/restos" className="bnav-btn"><span className="bnav-ico">⊞</span>Restos</a>
        <a href="/directeur/parametres" className="bnav-btn"><span className="bnav-ico">⚙</span>Paramètres</a>
      </nav>
      <Toast />
    </div>
  )
}
