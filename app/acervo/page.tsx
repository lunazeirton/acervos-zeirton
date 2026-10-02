import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function Archive() {
  const supabase = createClient()
  const { data } = await supabase.from('archive_items').select('id,title,slug,description,item_type,published_at').eq('status','published').order('published_at',{ascending:false})
  return <div className="mx-auto max-w-5xl px-5 py-16"><h1 className="font-serif text-5xl">Acervo</h1><p className="mt-4 max-w-2xl text-stone-600 dark:text-stone-400">Documentos, pesquisas, fotografias, mapas, trabalhos e outros registros preservados digitalmente.</p><div className="mt-10 grid gap-5 md:grid-cols-2">{data?.map((i:any)=><Link key={i.id} href={`/acervo/${i.slug}`} className="border border-stone-200 p-6 dark:border-stone-800"><span className="text-xs uppercase tracking-wider text-stone-500">{i.item_type}</span><h2 className="mt-2 font-serif text-2xl">{i.title}</h2><p className="mt-3 text-sm leading-6 text-stone-600 dark:text-stone-400">{i.description}</p></Link>)}</div></div>
}
