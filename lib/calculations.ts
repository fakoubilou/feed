import type { AppSettings } from './settings'
export { DEFAULT_SETTINGS } from './settings'

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

// ─────────────────────────────────────────────
// RENTABILITÉ
// ─────────────────────────────────────────────

export const FOOD_COST_DEFAULT = 0.30
export const TAUX_HORAIRE_DEFAULT = 15

export type Statut = 'rentable' | 'moyen' | 'risque' | 'vide'

export interface Rentabilite {
  masse_salariale: number
  cout_matiere: number
  profit: number
  marge: number
  statut: Statut
  explication: string
}

export function calcRentabilite(
  ca: number,
  staffHours: number,
  tauxHoraire: number = TAUX_HORAIRE_DEFAULT,
  foodCostPct: number = FOOD_COST_DEFAULT,
  margeBonne: number = 20,
  margeFaible: number = 10,
  masseSalarialeMax: number = 0.35,
): Rentabilite {
  if (!ca || !staffHours) return {
    masse_salariale: 0, cout_matiere: 0, profit: 0, marge: 0,
    statut: 'vide', explication: 'Aucune donnée',
  }
  const masse_salariale = staffHours * tauxHoraire
  const cout_matiere    = ca * foodCostPct
  const profit          = ca - (masse_salariale + cout_matiere)
  const marge           = (profit / ca) * 100
  const txSalaire       = masse_salariale / ca

  const statut: Statut = marge >= margeBonne ? 'rentable' : marge >= margeFaible ? 'moyen' : 'risque'

  // Explication: priority order independent of statut
  let explication: string
  if (txSalaire > masseSalarialeMax) {
    explication = `Masse salariale trop élevée (${Math.round(txSalaire * 100)}%)`
  } else if (foodCostPct > 0.33) {
    explication = `Food cost élevé (${Math.round(foodCostPct * 100)}%)`
  } else if (marge < margeFaible) {
    explication = 'Marge faible'
  } else {
    explication = 'Bonne performance'
  }

  return { masse_salariale, cout_matiere, profit, marge, statut, explication }
}

export function calcRentabiliteWithSettings(
  ca: number,
  staffHours: number,
  settings: AppSettings,
): Rentabilite {
  return calcRentabilite(
    ca, staffHours,
    settings.taux_horaire,
    settings.food_cost,
    settings.marge_bonne,
    settings.marge_faible,
    settings.masse_salariale_max,
  )
}

export const STATUT_CONFIG: Record<Statut, {
  label: string
  emoji: string
  color: string
  bg: string
  border: string
}> = {
  rentable: {
    label: 'Rentable',
    emoji: '🟢',
    color: 'var(--green)',
    bg: 'rgba(29,233,160,0.08)',
    border: 'rgba(29,233,160,0.18)',
  },
  moyen: {
    label: 'Moyen',
    emoji: '🟠',
    color: 'var(--orange)',
    bg: 'rgba(255,167,51,0.08)',
    border: 'rgba(255,167,51,0.18)',
  },
  risque: {
    label: 'À risque',
    emoji: '🔴',
    color: 'var(--red)',
    bg: 'rgba(255,91,91,0.08)',
    border: 'rgba(255,91,91,0.18)',
  },
  vide: {
    label: 'Aucun service',
    emoji: '⚫',
    color: 'var(--sub)',
    bg: 'rgba(255,255,255,0.04)',
    border: 'rgba(255,255,255,0.08)',
  },
}

// ─────────────────────────────────────────────
// ALERTES MÉTIER (legacy)
// ─────────────────────────────────────────────

export type AlerteType = 'danger' | 'warning' | 'success'

export interface AlerteMetier {
  type: AlerteType
  msg: string
}

export function getAlertesMetier(
  ca: number,
  staffHours: number,
  couverts: number,
  tauxHoraire: number = TAUX_HORAIRE_DEFAULT,
  seuilTicket: number = 50,
  foodCostPct: number = FOOD_COST_DEFAULT,
  margeBonne: number = 20,
  margeFaible: number = 10,
  masseSalarialeMax: number = 0.35,
): AlerteMetier[] {
  if (!ca) return []
  const r = calcRentabilite(ca, staffHours, tauxHoraire, foodCostPct, margeBonne, margeFaible, masseSalarialeMax)
  if (r.statut === 'vide') return []
  const alerts: AlerteMetier[] = []
  const ticket = ticketMoyen(ca, couverts)
  if (r.masse_salariale / ca > masseSalarialeMax)
    alerts.push({ type: 'danger', msg: `Masse salariale élevée — ${Math.round(r.masse_salariale / ca * 100)}% du CA` })
  if (couverts > 0 && ticket < seuilTicket)
    alerts.push({ type: 'warning', msg: `Ticket moyen faible — ${fmt(ticket)}€` })
  if (r.marge >= margeBonne && ca >= 1000)
    alerts.push({ type: 'success', msg: '🟢 Service performant' })
  return alerts
}
