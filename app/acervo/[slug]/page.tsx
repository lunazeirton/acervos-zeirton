import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function ArchiveItem({ params }: { params: { slug: string } }) {
  const supabase = createClient()
  const { data: item } = await supabase.from('archive_items').select('*,categories(name)').eq('slug',params.slug).eq('status','published').single()
  if (!item) notFound()
  return <article className="mx-auto max-w-4xl px-5 py-16"><p className="text-sm text-stone-500">{item.item_type} · {item.categories?.name || 'Acervo'}</p><h1 className="mt-4 font-serif text-5xl">{item.title}</h1>{item.description && <p className="mt-5 text-xl leading-8 text-stone-600 dark:text-stone-300">{item.description}</p>}{item.cover_url && <img src={item.cover_url} alt="" className="mt-10 w-full"/>}<div className="mt-10 space-y-6 text-stone-700 dark:text-stone-300">{item.context_text && <p className="whitespace-pre-wrap leading-8">{item.context_text}</p>}{item.original_author && <p><strong>Autor ou responsável:</strong> {item.original_author}</p>}{item.original_date && <p><strong>Data original:</strong> {new Date(item.original_date).toLocaleDateString('pt-BR')}</p>}{item.source_text && <p><strong>Fonte:</strong> {item.source_text}</p>}</div>{item.file_url && <div className="mt-10"><a href={item.file_url} target="_blank" rel="noreferrer" className="inline-block border border-stone-900 px-5 py-3 text-sm dark:border-white">Abrir arquivo completo</a>{item.file_url.toLowerCase().includes('.pdf') && <iframe src={item.file_url} className="mt-8 h-[75vh] w-full border" title={item.title}/>}</div>}</article>
}
