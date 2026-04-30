'use client'
import { calcStaffMinutes, minToStr } from '@/lib/calculations'

export interface StaffMember {
  id: number
  nom: string
  dh: string; dm: string
  fh: string; fm: string
  pause: string
}

interface Props {
  staff: StaffMember
  onChange: (s: StaffMember) => void
  onDelete: () => void
}

export function StaffRow({ staff, onChange, onDelete }: Props) {
  const mins = calcStaffMinutes(staff.dh, staff.dm, staff.fh, staff.fm, parseInt(staff.pause) || 0)
  const result = (staff.dh || staff.fh) && mins !== null ? '= ' + minToStr(mins) : '—'

  const upd = (field: keyof StaffMember) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...staff, [field]: e.target.value })

  return (
    <div className="staff-row">
      <div className="staff-top">
        <input className="staff-name" type="text" placeholder="Prénom" value={staff.nom} onChange={upd('nom')} autoComplete="off" />
        <button className="staff-delete" onClick={onDelete}>×</button>
      </div>
      <div className="staff-times">
        <div className="staff-block">
          <input className="staff-hm" type="number" placeholder="18" min={0} max={23} inputMode="numeric" value={staff.dh} onChange={upd('dh')} />
          <span className="staff-sep">h</span>
          <input className="staff-hm" type="number" placeholder="00" min={0} max={59} inputMode="numeric" value={staff.dm} onChange={upd('dm')} />
        </div>
        <span className="staff-arrow">→</span>
        <div className="staff-block">
          <input className="staff-hm" type="number" placeholder="02" min={0} max={23} inputMode="numeric" value={staff.fh} onChange={upd('fh')} />
          <span className="staff-sep">h</span>
          <input className="staff-hm" type="number" placeholder="15" min={0} max={59} inputMode="numeric" value={staff.fm} onChange={upd('fm')} />
        </div>
        <div className="staff-pause-wrap">
          <span>-</span>
          <input className="staff-pause" type="number" placeholder="0" min={0} inputMode="numeric" value={staff.pause} onChange={upd('pause')} />
          <span>min</span>
        </div>
      </div>
      <div className="staff-result">{result}</div>
    </div>
  )
}
