import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { HeroBlock } from '@/components/directeur/HeroBlock'
import { AlertsZone } from '@/components/directeur/AlertsZone'
import { RestoList } from '@/components/directeur/RestoList'
import { ProfitChart } from '@/components/ProfitChart'
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

  // Aggregate all restaurants by date for the trend chart
  const byDate: Record<string, { ca: number; staff_hours: number }> = {}
  recentRaz.forEach(e => {
    if (!byDate[e.date]) byDate[e.date] = { ca: 0, staff_hours: 0 }
    byDate[e.date].ca += e.ca
    byDate[e.date].staff_hours += e.staff_hours
  })
  const aggregatedEntries: RazEntry[] = Object.entries(byDate).map(([date, v]) => ({
    id: date, restaurant_id: '', date,
    ca: v.ca, staff_hours: v.staff_hours,
    couverts: 0, offerts: 0, annulations: 0,
    ouverture: null, fermeture: null, note: '', created_at: '',
  }))

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
        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <HeroBlock restaurants={restaurants} latestRaz={latestRaz} />
          {aggregatedEntries.length >= 2 && (
            <div style={{
              width: '100%',
              background: 'rgba(255,255,255,0.03)', border: '1px solid var(--line2)',
              borderRadius: 14, padding: '14px 10px 8px', marginTop: 12,
              display: 'flex', flexDirection: 'column', alignItems: 'center',
            }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--dim)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4, textAlign: 'center', width: '100%' }}>
                Profit agrégé — tendance
              </div>
              <ProfitChart entries={aggregatedEntries} />
            </div>
          )}
        </div>
        <div className="section">
          <AlertsZone restaurants={restaurants} latestRaz={latestRaz} />
          <div className="sec-label">Restaurants</div>
          <RestoList restaurants={restaurants} latestRaz={latestRaz} />
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
