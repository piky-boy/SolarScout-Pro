import { DM_Sans, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { ChunkLoadErrorHandler } from '@/components/chunk-load-error-handler'
import { Providers } from '@/components/providers'
import type { Metadata } from 'next'

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-sans' })
const jakartaSans = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-display' })
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL ?? 'http://localhost:3000'),
  title: {
    default: 'SolarScout Pro — Automated Solar Lead Generation for Europe',
    template: '%s | SolarScout Pro',
  },
  description:
    'SolarScout Pro automatically detects commercial buildings and warehouses across Romania, Spain, Portugal, Albania and the United Kingdom — turning satellite data into ready-to-contact solar leads.',
  keywords: [
    'solar leads',
    'solar lead generation',
    'commercial solar',
    'warehouses solar',
    'Romania solar',
    'Spain solar',
    'Portugal solar',
    'Albania solar',
    'UK solar',
    'United Kingdom solar',
    'satellite building detection',
  ],
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
  openGraph: {
    title: 'SolarScout Pro — Automated Solar Lead Generation for Europe',
    description:
      'Turn satellite data into ready-to-contact solar leads across Romania, Spain, Portugal, Albania and the United Kingdom.',
    images: ['/og-image.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SolarScout Pro',
    description:
      'Automated solar lead generation for commercial buildings across Romania, Spain, Portugal, Albania and the United Kingdom.',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script src="https://apps.abacus.ai/chatllm/appllm-lib.js" async></script>
        <link
          href="https://api.mapbox.com/mapbox-gl-js/v3.5.2/mapbox-gl.css"
          rel="stylesheet"
        />
      </head>
      <body className={`${dmSans.variable} ${jakartaSans.variable} ${jetbrainsMono.variable} font-sans`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            {children}
            <Toaster />
            <ChunkLoadErrorHandler />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}
