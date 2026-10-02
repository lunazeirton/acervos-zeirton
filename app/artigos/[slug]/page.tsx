import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function Article({ params }: { params: { slug: string } }) {
  const supabase = createClient()
  const { data: a } = await supabase.from('articles').select('*,categories(name),profiles(display_name)').eq('slug',params.slug).eq('status','published').single()
  if (!a) notFound()
  return <article className="mx-auto max-w-3xl px-5 py-16">
    <p className="text-sm text-stone-500">{a.categories?.name} · {a.reading_time || 1} min de leitura</p>
    <h1 className="mt-4 font-serif text-4xl font-semibold tracking-tight md:text-6xl">{a.title}</h1>
    {a.subtitle && <p className="mt-5 text-xl leading-8 text-stone-600 dark:text-stone-300">{a.subtitle}</p>}
    <div className="mt-7 text-sm text-stone-500">Por {a.profiles?.display_name || 'Zeirton Luna'} · {new Date(a.published_at).toLocaleDateString('pt-BR')}</div>
    {a.cover_url && <img src={a.cover_url} alt="" className="mt-10 w-full" />}
    <div className="prose-zeirton mt-12" dangerouslySetInnerHTML={{ __html: a.content_html || '' }} />
    {a.references_text && <section className="mt-14 border-t border-stone-200 pt-8 dark:border-stone-800"><h2 className="font-serif text-2xl">Referências e fontes</h2><p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-stone-600 dark:text-stone-400">{a.references_text}</p></section>}
  </article>
}
