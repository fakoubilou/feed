import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LoginForm } from '@/components/login/LoginForm'
import { Toast } from '@/components/Toast'

export default async function LoginPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/')

  const { data: restaurants } = await supabase
    .from('restaurants')
    .select('*')
    .order('name')

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', position: 'relative' }}>
      <div style={{ position: 'fixed', top: -80, left: '50%', transform: 'translateX(-50%)', width: 600, height: 400, background: 'radial-gradient(ellipse, rgba(108,114,255,0.18) 0%, transparent 65%)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: -100, right: -100, width: 400, height: 400, background: 'radial-gradient(ellipse, rgba(90,180,255,0.08) 0%, transparent 65%)', pointerEvents: 'none' }} />
      <LoginForm restaurants={restaurants ?? []} />
      <Toast />
    </div>
  )
}
