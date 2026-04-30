import type { Metadata } from 'next'
import './globals.css'
import { SplashScreen } from '@/components/SplashScreen'

export const metadata: Metadata = {
  title: 'Feed — Pilotage opérationnel',
  description: 'Outil de pilotage opérationnel pour la restauration',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <SplashScreen />
        {children}
      </body>
    </html>
  )
}
