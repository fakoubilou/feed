'use client'
import { useState, useEffect } from 'react'
import { loadSettings, saveSettings, DEFAULT_SETTINGS } from './settings'
import type { AppSettings } from './settings'

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)

  useEffect(() => {
    setSettings(loadSettings())
  }, [])

  function update(s: AppSettings) {
    saveSettings(s)
    setSettings(s)
  }

  return { settings, update }
}
