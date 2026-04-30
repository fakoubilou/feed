export const fmt = (n: number) =>
  new Intl.NumberFormat('fr-FR').format(Math.round(n))

export const ticketMoyen = (ca: number, cov: number) =>
  cov > 0 ? ca / cov : 0

export const coprod = (staffHours: number, ca: number) =>
  staffHours > 0 ? ca / staffHours : 0

export const coprodColor = (val: number) =>
  val >= 50 ? 'var(--green)' : val >= 40 ? 'var(--orange)' : 'var(--red)'

export const coprodLabel = (val: number) =>
  val > 0 ? val.toFixed(1) + '€/h' : '—'

export const isoToday = () => new Date().toISOString().split('T')[0]

export const todayFull = () =>
  new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

export const dateStr = (d: string) =>
  new Date(d).toLocaleDateString('fr-FR', {
    weekday: 'short', day: 'numeric', month: 'short',
  })

export const minToStr = (min: number | null) => {
  if (min === null || min < 0) return '—'
  const h = Math.floor(min / 60)
  const m = min % 60
  return `${h}h${m < 10 ? '0' + m : m}`
}

export const calcStaffMinutes = (
  dh: string, dm: string, fh: string, fm: string, pauseMin: number
): number | null => {
  const dHour = parseInt(dh), dMin = parseInt(dm) || 0
  const fHour = parseInt(fh), fMin = parseInt(fm) || 0
  if (isNaN(dHour) || isNaN(fHour)) return null
  let d = dHour * 60 + dMin
  let f = fHour * 60 + fMin
  if (f <= d) f += 24 * 60
  const total = f - d - (pauseMin || 0)
  return total > 0 ? total : 0
}
