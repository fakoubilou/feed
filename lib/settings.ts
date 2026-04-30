export interface AppSettings {
  marge_bonne: number        // default 20 (%)
  marge_faible: number       // default 10 (%)
  masse_salariale_max: number // default 0.35 (35%)
  taux_horaire: number       // default 15 (€/h)
  food_cost: number          // default 0.30 (30%)
}

export const DEFAULT_SETTINGS: AppSettings = {
  marge_bonne: 20,
  marge_faible: 10,
  masse_salariale_max: 0.35,
  taux_horaire: 15,
  food_cost: 0.30,
}

const KEY = 'feed_settings'

export function loadSettings(): AppSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS
  try {
    const s = localStorage.getItem(KEY)
    return s ? { ...DEFAULT_SETTINGS, ...JSON.parse(s) } : DEFAULT_SETTINGS
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(s: AppSettings) {
  localStorage.setItem(KEY, JSON.stringify(s))
}
