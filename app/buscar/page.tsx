import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function Search({ searchParams }: { searchParams: { q?: string } }) {
  const q = (searchParams.q || '').trim()
  const supabase = createClient()
  const { data } = q ? await supabase.rpc('search_public_content', { search_text: q }) : { data: [] }
  return <div className="mx-auto max-w-4xl px-5 py-16"><h1 className="font-serif text-5xl">Pesquisa</h1><form className="mt-8"><input name="q" defaultValue={q} placeholder="Pesquisar artigos e acervo..." className="w-full border border-stone-300 bg-transparent px-5 py-4 text-lg outline-none dark:border-stone-700"/></form>{q && <p className="mt-6 text-sm text-stone-500">Resultados para “{q}”</p>}<div className="mt-6 divide-y divide-stone-200 dark:divide-stone-800">{data?.map((r:any)=><article key={`${r.content_type}-${r.id}`} className="py-6"><span className="text-xs uppercase tracking-wider text-stone-500">{r.content_type === 'article' ? 'Artigo' : 'Acervo'}</span><h2 className="mt-2 font-serif text-2xl"><Link href={r.content_type === 'article' ? `/artigos/${r.slug}` : `/acervo/${r.slug}`}>{r.title}</Link></h2><p className="mt-2 text-sm text-stone-600 dark:text-stone-400">{r.excerpt}</p></article>)}</div></div>
}
