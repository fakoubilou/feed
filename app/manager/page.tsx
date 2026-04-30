import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { RAZForm } from '@/components/manager/RAZForm'
import { Toast } from '@/components/Toast'
import { todayFull } from '@/lib/calculations'
import { LogoutButton } from '@/components/LogoutButton'
import type { Profile, Restaurant } from '@/lib/supabase/types'

export default async function ManagerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profileRaw } = await supabase
    .from('profiles')
    .select('role, restaurant_id, nom')
    .eq('id', user.id)
    .single()

  const profile = profileRaw as Profile | null
  if (!profile || profile.role !== 'manager') redirect('/')

  if (!profile.restaurant_id) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <header className="topbar"><div className="tb-logo">Feed.</div></header>
        <div className="empty">
          <div className="empty-ico">⚠</div>
          <div className="empty-txt">Aucun restaurant assigné.<br />Contacte ton directeur.</div>
        </div>
      </div>
    )
  }

  const { data: restaurantRaw } = await supabase
    .from('restaurants')
    .select('*')
    .eq('id', profile.restaurant_id)
    .single()

  const restaurant = restaurantRaw as Restaurant | null
  if (!restaurant) redirect('/login')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <header className="topbar">
        <div className="tb-logo">Feed.</div>
        <div className="tb-right">
          <div className="tb-badge">{profile.nom || 'Manager'}</div>
          <LogoutButton />
        </div>
      </header>

      <div className="scroll-area">
        <div className="page-head">
          <div className="page-head-title">{restaurant.name}</div>
          <div className="page-head-sub">{todayFull()}</div>
        </div>
        <RAZForm restaurant={restaurant} />
      </div>

      <nav className="bottom-nav">
        <a href="/manager" className="bnav-btn active"><span className="bnav-ico">✦</span>RAZ</a>
        <a href="/manager/historique" className="bnav-btn"><span className="bnav-ico">≡</span>Historique</a>
      </nav>

      <Toast />
    </div>
  )
}
