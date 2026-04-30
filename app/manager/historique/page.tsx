import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { HistoList } from '@/components/manager/HistoList'
import { Toast } from '@/components/Toast'
import { LogoutButton } from '@/components/LogoutButton'
import type { Profile, RazEntry } from '@/lib/supabase/types'

export default async function HistoriquePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profileRaw } = await supabase
    .from('profiles')
    .select('role, restaurant_id, nom')
    .eq('id', user.id)
    .single()

  const profile = profileRaw as Profile | null
  if (!profile || profile.role !== 'manager' || !profile.restaurant_id) redirect('/manager')

  const { data: restaurantRaw } = await supabase
    .from('restaurants')
    .select('name')
    .eq('id', profile.restaurant_id)
    .single()

  const restaurant = restaurantRaw as { name: string } | null

  const { data: entriesRaw } = await supabase
    .from('raz_entries')
    .select('*')
    .eq('restaurant_id', profile.restaurant_id)
    .order('date', { ascending: false })
    .limit(30)

  const entries = (entriesRaw as RazEntry[]) ?? []

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
          <div className="page-head-title">{restaurant?.name ?? 'Historique'}</div>
        </div>
        <div className="section">
          <HistoList entries={entries} />
        </div>
      </div>

      <nav className="bottom-nav">
        <a href="/manager" className="bnav-btn"><span className="bnav-ico">✦</span>RAZ</a>
        <a href="/manager/historique" className="bnav-btn active"><span className="bnav-ico">≡</span>Historique</a>
      </nav>

      <Toast />
    </div>
  )
}
