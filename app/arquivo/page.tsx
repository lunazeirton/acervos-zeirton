import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function ChronologicalArchive() {
  const supabase = createClient()
  const { data } = await supabase.from('articles').select('id,title,slug,published_at').eq('status','published').order('published_at',{ascending:false})
  const grouped = (data || []).reduce((acc:any,a:any)=>{ const d=new Date(a.published_at); const y=d.getFullYear(); const m=d.toLocaleDateString('pt-BR',{month:'long'}); acc[y] ||= {}; acc[y][m] ||= []; acc[y][m].push(a); return acc },{})
  return <div className="mx-auto max-w-4xl px-5 py-16"><h1 className="font-serif text-5xl">Arquivo</h1><p className="mt-4 text-stone-600 dark:text-stone-400">Publicações organizadas cronologicamente.</p><div className="mt-10 space-y-12">{Object.entries(grouped).map(([year,months]:any)=><section key={year}><h2 className="font-serif text-4xl">{year}</h2><div className="mt-6 space-y-8">{Object.entries(months).map(([month,items]:any)=><div key={month}><h3 className="mb-3 capitalize text-sm font-medium uppercase tracking-wider text-stone-500">{month}</h3><ul className="space-y-3">{items.map((a:any)=><li key={a.id}><Link href={`/artigos/${a.slug}`} className="font-serif text-xl hover:underline">{a.title}</Link></li>)}</ul></div>)}</div></section>)}</div></div>
}
