import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const revalidate = 60

export default async function Home() {
  const supabase = createClient()
  const { data: articles } = await supabase.from('articles').select('id,title,slug,excerpt,cover_url,published_at,categories(name)').eq('status','published').order('published_at',{ascending:false}).limit(6)
  const { data: archive } = await supabase.from('archive_items').select('id,title,slug,item_type,cover_url,published_at').eq('status','published').order('published_at',{ascending:false}).limit(4)
  const { data: categories } = await supabase.from('categories').select('id,name,slug').order('name').limit(12)
  return <div>
    <section className="mx-auto max-w-6xl px-5 py-20 md:py-28">
      <p className="mb-5 text-sm uppercase tracking-[.2em] text-stone-500">Artigos, reflexões e acervo</p>
      <h1 className="max-w-4xl font-serif text-5xl font-semibold tracking-tight md:text-7xl">Zeirton Luna</h1>
      <p className="mt-7 max-w-2xl text-xl leading-8 text-stone-600 dark:text-stone-300">Artigos, reflexões, pesquisas e registros reunidos em um só lugar.</p>
    </section>
    <section className="mx-auto max-w-6xl px-5 py-10"><div className="mb-8 flex items-end justify-between"><h2 className="font-serif text-3xl">Artigos recentes</h2><Link href="/artigos" className="text-sm underline">Ver todos</Link></div><div className="grid gap-8 md:grid-cols-3">{articles?.map((a:any)=><article key={a.id} className="border-t border-stone-300 pt-5 dark:border-stone-700"><p className="text-xs uppercase tracking-wider text-stone-500">{a.categories?.name || 'Artigo'}</p><h3 className="mt-3 font-serif text-2xl leading-tight"><Link href={`/artigos/${a.slug}`}>{a.title}</Link></h3><p className="mt-3 text-sm leading-6 text-stone-600 dark:text-stone-400">{a.excerpt}</p></article>)}</div></section>
    <section className="mx-auto max-w-6xl px-5 py-14"><h2 className="mb-8 font-serif text-3xl">Acervo</h2><div className="grid gap-4 md:grid-cols-2">{archive?.map((i:any)=><Link key={i.id} href={`/acervo/${i.slug}`} className="border border-stone-200 p-6 hover:bg-white dark:border-stone-800 dark:hover:bg-stone-900"><span className="text-xs uppercase tracking-wider text-stone-500">{i.item_type}</span><h3 className="mt-2 font-serif text-xl">{i.title}</h3></Link>)}</div></section>
    <section className="mx-auto max-w-6xl px-5 py-14"><h2 className="mb-6 font-serif text-3xl">Categorias</h2><div className="flex flex-wrap gap-3">{categories?.map((c:any)=><Link key={c.id} href={`/artigos?categoria=${c.slug}`} className="rounded-full border border-stone-300 px-4 py-2 text-sm dark:border-stone-700">{c.name}</Link>)}</div></section>
  </div>
}
