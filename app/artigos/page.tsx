import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function Articles({ searchParams }: { searchParams: { categoria?: string } }) {
  const supabase = createClient()
  let q = supabase.from('articles').select('id,title,slug,excerpt,published_at,categories(name,slug)').eq('status','published').order('published_at',{ascending:false})
  if (searchParams.categoria) q = q.eq('categories.slug', searchParams.categoria)
  const { data } = await q
  return <div className="mx-auto max-w-4xl px-5 py-16"><h1 className="font-serif text-5xl">Artigos</h1><div className="mt-10 divide-y divide-stone-200 dark:divide-stone-800">{data?.map((a:any)=><article key={a.id} className="py-7"><p className="text-xs uppercase tracking-wider text-stone-500">{a.categories?.name}</p><h2 className="mt-2 font-serif text-3xl"><Link href={`/artigos/${a.slug}`}>{a.title}</Link></h2><p className="mt-3 text-stone-600 dark:text-stone-400">{a.excerpt}</p></article>)}</div></div>
}
