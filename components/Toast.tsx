'use client'
import { useEffect, useRef } from 'react'

let globalToast: ((msg: string) => void) | null = null

export function toast(msg: string) {
  globalToast?.(msg)
}

export function Toast() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    globalToast = (msg: string) => {
      const el = ref.current
      if (!el) return
      el.textContent = msg
      el.classList.add('show')
      setTimeout(() => el.classList.remove('show'), 2400)
    }
    return () => { globalToast = null }
  }, [])

  return <div className="toast" ref={ref} />
}
