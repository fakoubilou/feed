import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Toast } from '@/components/Toast'
import { LogoutButton } from '@/components/LogoutButton'
import { AddRestoForm } from '@/components/directeur/AddRestoForm'
import type { Restaurant } from '@/lib/supabase/types'

export default async function RestosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profileRaw } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const profile = profileRaw as { role: string } | null
  if (!profile || profile.role !== 'directeur') redirect('/')

  const { data: restaurantsRaw } = await supabase.from('restaurants').select('*').order('name')
  const restaurants = (restaurantsRaw as Restaurant[]) ?? []

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
        <div className="page-head"><div className="page-head-title">Restaurants</div></div>
        <div className="section">
          <div className="cfg-list">
            {restaurants.map(r => (
              <div key={r.id} className="cfg-row">
                <div>
                  <div className="cfg-name">{r.name}</div>
                  <div className="cfg-taux">{r.taux_horaire.toFixed(2)} €/h</div>
                </div>
              </div>
            ))}
          </div>
          <div className="sec-label" style={{ marginTop: 20 }}>Ajouter</div>
          <AddRestoForm />
        </div>
      </div>

      <nav className="bottom-nav">
        <a href="/directeur" className="bnav-btn"><span className="bnav-ico">◉</span>Dashboard</a>
        <a href="/directeur/restos" className="bnav-btn active"><span className="bnav-ico">⊞</span>Restos</a>
      </nav>
      <Toast />
    </div>
  )
}
