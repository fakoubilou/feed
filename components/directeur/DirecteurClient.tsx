'use client'
import { useState } from 'react'
import { RestoList } from './RestoList'
import { ProfitChart } from '@/components/ProfitChart'
import type { Restaurant, RazEntry } from '@/lib/supabase/types'

interface Props {
  restaurants: Restaurant[]
  latestRaz: Record<string, RazEntry | undefined>
  recentRaz: RazEntry[]
}

export function DirecteurClient({ restaurants, latestRaz, recentRaz }: Props) {
  const [selectedResto, setSelectedResto] = useState<string | null>(null)

  const selectedEntries = selectedResto
    ? recentRaz.filter(e => e.restaurant_id === selectedResto)
    : []

  const selectedName = selectedResto
    ? restaurants.find(r => r.id === selectedResto)?.name
    : null

  return (
    <>
      {selectedResto !== null && selectedEntries.length >= 2 && (
        <div style={{
          width: '100%',
          background: 'rgba(255,255,255,0.03)', border: '1px solid var(--line2)',
          borderRadius: 14, padding: '14px 10px 8px', marginBottom: 12,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 4 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--dim)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              {selectedName} — tendance profit
            </div>
            <button
              onClick={() => setSelectedResto(null)}
              style={{ background: 'none', border: 'none', color: 'var(--dim)', fontSize: 14, cursor: 'pointer', padding: '0 4px', lineHeight: 1 }}
            >
              ✕
            </button>
          </div>
          <ProfitChart entries={selectedEntries} />
        </div>
      )}
      <RestoList
        restaurants={restaurants}
        latestRaz={latestRaz}
        onSelect={setSelectedResto}
        selectedId={selectedResto}
      />
    </>
  )
}
