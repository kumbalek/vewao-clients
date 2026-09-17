import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import { NextIntlClientProvider } from "next-intl"
import "styles/globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="cs" data-mode="light">
      <head>
        <link rel="stylesheet" href="https://use.typekit.net/jwc1iop.css" />
      </head>
      <body>
        <main className="relative">
          <NextIntlClientProvider>{props.children}</NextIntlClientProvider>
        </main>
      </body>
    </html>
  )
}
