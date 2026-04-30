import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Toast } from '@/components/Toast'
import { LogoutButton } from '@/components/LogoutButton'
import { ParametresForm } from '@/components/directeur/ParametresForm'
import { ImportForm } from '@/components/directeur/ImportForm'
import type { Restaurant } from '@/lib/supabase/types'

export default async function ParametresPage() {
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
        <div className="page-head">
          <div className="page-head-title">Paramètres</div>
        </div>
        <div className="section">
          <div className="sec-label">Calculs de rentabilité</div>
          <ParametresForm />

          {restaurants.length > 0 && (
            <>
              <div className="sec-label" style={{ marginTop: 28 }}>Importer une RAZ</div>
              <ImportForm restaurants={restaurants} />
            </>
          )}
        </div>
      </div>

      <nav className="bottom-nav">
        <a href="/directeur" className="bnav-btn"><span className="bnav-ico">◉</span>Dashboard</a>
        <a href="/directeur/restos" className="bnav-btn"><span className="bnav-ico">⊞</span>Restos</a>
        <a href="/directeur/parametres" className="bnav-btn active"><span className="bnav-ico">⚙</span>Paramètres</a>
      </nav>
      <Toast />
    </div>
  )
}
