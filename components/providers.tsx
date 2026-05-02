'use client'

import { SessionProvider } from 'next-auth/react'
import { ReactNode } from 'react'
import { AnalyticsProvider } from '@/components/analytics/analytics-provider'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AnalyticsProvider />
      {children}
    </SessionProvider>
  )
}
