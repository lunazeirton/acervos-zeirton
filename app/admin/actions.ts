'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = createClient()
  const email = String(formData.get('email') || '')
  const password = String(formData.get('password') || '')
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) redirect('/admin/login?erro=1')
  redirect('/admin')
}

export async function logout() {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect('/admin/login')
}

export async function saveArticle(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')
  const title = String(formData.get('title') || '').trim()
  const slug = String(formData.get('slug') || '').trim().toLowerCase().replace(/[^a-z0-9-]+/g,'-').replace(/^-|-$/g,'')
  const status = String(formData.get('status') || 'draft')
  const payload = {
    title,
    slug,
    subtitle: String(formData.get('subtitle') || ''),
    excerpt: String(formData.get('excerpt') || ''),
    content_html: String(formData.get('content_html') || ''),
    references_text: String(formData.get('references_text') || ''),
    status,
    author_id: user.id,
    published_at: status === 'published' ? new Date().toISOString() : null,
  }
  const id = String(formData.get('id') || '')
  if (id) await supabase.from('articles').update(payload).eq('id', id)
  else await supabase.from('articles').insert(payload)
  revalidatePath('/')
  revalidatePath('/artigos')
  redirect('/admin')
}

export async function deleteArticle(formData: FormData) {
  const supabase = createClient()
  await supabase.from('articles').delete().eq('id', String(formData.get('id')))
  revalidatePath('/')
  revalidatePath('/artigos')
  redirect('/admin')
}
