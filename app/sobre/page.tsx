import { createClient } from '@/lib/supabase/server'

export default async function About() {
  const supabase = createClient()
  const { data } = await supabase.from('site_settings').select('about_html').eq('id',1).single()
  return <article className="mx-auto max-w-3xl px-5 py-16"><h1 className="font-serif text-5xl">Sobre</h1><div className="prose-zeirton mt-10" dangerouslySetInnerHTML={{__html:data?.about_html || '<p>Zeirton Luna. Espaço pessoal dedicado à escrita, pesquisa, memória e preservação de conteúdo.</p>'}} /></article>
}
