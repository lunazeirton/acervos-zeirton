import './globals.css'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: { default: 'Zeirton Luna | Artigos, reflexões e acervo', template: '%s | Zeirton Luna' },
  description: 'Artigos, reflexões, pesquisas e registros reunidos em um só lugar.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: { type: 'website', title: 'Zeirton Luna', description: 'Artigos, reflexões e acervo' },
}

const nav = [
  ['Artigos', '/artigos'], ['Acervo', '/acervo'], ['Arquivo', '/arquivo'], ['Sobre', '/sobre'], ['Buscar', '/buscar']
]

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <header className="border-b border-stone-200 dark:border-stone-800">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-5">
            <Link href="/" className="font-serif text-2xl font-semibold tracking-tight">Zeirton Luna</Link>
            <nav className="flex flex-wrap items-center justify-end gap-x-5 gap-y-2 text-sm text-stone-600 dark:text-stone-300">
              {nav.map(([label, href]) => <Link key={href} href={href} className="hover:text-stone-950 dark:hover:text-white">{label}</Link>)}
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="mt-20 border-t border-stone-200 dark:border-stone-800">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-10 text-sm text-stone-500 md:flex-row md:items-center md:justify-between">
            <span>© Zeirton Luna</span>
            <div className="flex gap-5"><Link href="/artigos">Artigos</Link><Link href="/acervo">Acervo</Link><Link href="/arquivo">Arquivo</Link><Link href="/sobre">Sobre</Link></div>
          </div>
        </footer>
      </body>
    </html>
  )
}
