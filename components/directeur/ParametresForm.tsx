'use client'
import { useState, useEffect } from 'react'
import { useSettings } from '@/lib/useSettings'
import { toast } from '@/components/Toast'

export function ParametresForm() {
  const { settings, update } = useSettings()

  const [margeBonne, setMargeBonne] = useState(settings.marge_bonne.toString())
  const [margeFaible, setMargeFaible] = useState(settings.marge_faible.toString())
  const [masseMax, setMasseMax] = useState(Math.round(settings.masse_salariale_max * 100).toString())
  const [tauxHoraire, setTauxHoraire] = useState(settings.taux_horaire.toString())
  const [foodCost, setFoodCost] = useState(Math.round(settings.food_cost * 100).toString())

  useEffect(() => {
    setMargeBonne(settings.marge_bonne.toString())
    setMargeFaible(settings.marge_faible.toString())
    setMasseMax(Math.round(settings.masse_salariale_max * 100).toString())
    setTauxHoraire(settings.taux_horaire.toString())
    setFoodCost(Math.round(settings.food_cost * 100).toString())
  }, [settings.marge_bonne, settings.marge_faible, settings.masse_salariale_max, settings.taux_horaire, settings.food_cost])

  function handleSave() {
    const mb = parseFloat(margeBonne)
    const mf = parseFloat(margeFaible)
    const mm = parseFloat(masseMax)
    const th = parseFloat(tauxHoraire)
    const fc = parseFloat(foodCost)

    if ([mb, mf, mm, th, fc].some(isNaN)) { toast('⚠ Valeurs invalides'); return }
    if (mf >= mb) { toast('⚠ Marge faible doit être inférieure à marge bonne'); return }

    update({
      marge_bonne: mb,
      marge_faible: mf,
      masse_salariale_max: mm / 100,
      taux_horaire: th,
      food_cost: fc / 100,
    })
    toast('Paramètres sauvegardés ✓')
  }

  function handleReset() {
    setMargeBonne('20')
    setMargeFaible('10')
    setMasseMax('35')
    setTauxHoraire('15')
    setFoodCost('30')
    update({ marge_bonne: 20, marge_faible: 10, masse_salariale_max: 0.35, taux_horaire: 15, food_cost: 0.30 })
    toast('Paramètres réinitialisés')
  }

  return (
    <>
      <div className="field">
        <label>Marge bonne (%)</label>
        <input type="number" value={margeBonne} onChange={e => setMargeBonne(e.target.value)} min={0} max={100} step={1} />
        <div style={{ fontSize: 11, color: 'var(--dim)', marginTop: 4 }}>Seuil au-dessus duquel le service est rentable (défaut : 20)</div>
      </div>
      <div className="field">
        <label>Marge faible (%)</label>
        <input type="number" value={margeFaible} onChange={e => setMargeFaible(e.target.value)} min={0} max={100} step={1} />
        <div style={{ fontSize: 11, color: 'var(--dim)', marginTop: 4 }}>En-dessous : zone à risque (défaut : 10)</div>
      </div>
      <div className="field">
        <label>Masse salariale max (%)</label>
        <input type="number" value={masseMax} onChange={e => setMasseMax(e.target.value)} min={0} max={100} step={1} />
        <div style={{ fontSize: 11, color: 'var(--dim)', marginTop: 4 }}>Seuil d'alerte pour la masse salariale (défaut : 35)</div>
      </div>
      <div className="field">
        <label>Taux horaire (€/h)</label>
        <input type="number" value={tauxHoraire} onChange={e => setTauxHoraire(e.target.value)} min={0} step={0.5} />
        <div style={{ fontSize: 11, color: 'var(--dim)', marginTop: 4 }}>Coût moyen par heure travaillée (défaut : 15)</div>
      </div>
      <div className="field">
        <label>Food cost (%)</label>
        <input type="number" value={foodCost} onChange={e => setFoodCost(e.target.value)} min={0} max={100} step={1} />
        <div style={{ fontSize: 11, color: 'var(--dim)', marginTop: 4 }}>Part du CA consacrée aux matières premières (défaut : 30)</div>
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        <button className="btn-main" style={{ flex: 1 }} onClick={handleSave}>Sauvegarder</button>
        <button className="btn-ghost" onClick={handleReset}>Réinitialiser</button>
      </div>
    </>
  )
}
