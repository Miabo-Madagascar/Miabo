/**
 * Layout racine i18n — enveloppe toutes les pages avec la locale active.
 * TODO PHASE 1 : brancher next-intl (NextIntlClientProvider).
 */

import type { Metadata } from "next"

export const metadata: Metadata = {
  title:       "MIABO — Tutorat Madagascar",
  description: "Plateforme de tutorat scolaire pour Madagascar",
  manifest:    "/manifest.json",
}

interface LocaleLayoutProps {
  children:    React.ReactNode
  params:      Promise<{ locale: string }>
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params

  return (
    <html lang={locale}>
      <body>
        {/* TODO : <NextIntlClientProvider locale={locale} messages={messages}> */}
        {children}
        {/* TODO : </NextIntlClientProvider> */}
      </body>
    </html>
  )
}

export function generateStaticParams() {
  return [{ locale: "fr" }, { locale: "mg" }]
}
