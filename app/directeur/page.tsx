import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { HeroBlock } from '@/components/directeur/HeroBlock'
import { AlertsZone } from '@/components/directeur/AlertsZone'
import { DirecteurClient } from '@/components/directeur/DirecteurClient'
import { Toast } from '@/components/Toast'
import { todayFull } from '@/lib/calculations'
import { LogoutButton } from '@/components/LogoutButton'
import type { Restaurant, RazEntry } from '@/lib/supabase/types'

export default async function DirecteurPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profileRaw } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const profile = profileRaw as { role: string } | null
  if (!profile || profile.role !== 'directeur') redirect('/')

  const { data: restaurantsRaw } = await supabase
    .from('restaurants')
    .select('*')
    .order('name')

  const { data: recentRazRaw } = await supabase
    .from('raz_entries')
    .select('*')
    .order('date', { ascending: false })

  const restaurants = (restaurantsRaw as Restaurant[]) ?? []
  const recentRaz = (recentRazRaw as RazEntry[]) ?? []

  const latestRaz: Record<string, RazEntry> = {}
  recentRaz.forEach(r => {
    if (!latestRaz[r.restaurant_id]) latestRaz[r.restaurant_id] = r
  })

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
          <div className="page-head-sub" style={{ marginBottom: 16 }}>{todayFull()}</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <div style={{ width: '100%', maxWidth: 420 }}>
            <div style={{ padding: '0 16px' }}>
              <HeroBlock restaurants={restaurants} latestRaz={latestRaz} />
            </div>
            <div className="section">
              <AlertsZone restaurants={restaurants} latestRaz={latestRaz} />
              <div className="sec-label">Restaurants</div>
              <DirecteurClient restaurants={restaurants} latestRaz={latestRaz} recentRaz={recentRaz} />
            </div>
          </div>
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
