import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cfg = window.__SITE_CONFIG__ || {};
const articlesEl = document.querySelector('#articles');
const archiveEl = document.querySelector('#archive');
const searchEl = document.querySelector('#search');
const reader = document.querySelector('#reader');
const readerTitle = document.querySelector('#reader-title');
const readerMeta = document.querySelector('#reader-meta');
const readerContent = document.querySelector('#reader-content');
const loginForm = document.querySelector('#login-form');
const articleForm = document.querySelector('#article-form');
const loginStatus = document.querySelector('#login-status');
const articleStatusText = document.querySelector('#article-status-text');

if (!cfg.SUPABASE_URL || !cfg.SUPABASE_ANON_KEY) {
  const msg = '<p class="muted">O site está no ar. Falta apenas configurar a chave pública do Supabase para carregar os artigos e o acervo.</p>';
  articlesEl.innerHTML = msg;
  archiveEl.innerHTML = msg;
  loginStatus.textContent = 'A conexão com o Supabase ainda precisa da chave pública do projeto.';
  throw new Error('Missing Supabase public configuration');
}

const supabase = createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
let articles = [];
let archiveItems = [];

const formatDate = (value) => value ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(new Date(value)) : '';
const stripHtml = (html='') => { const d=document.createElement('div'); d.innerHTML=html; return d.textContent || ''; };
const escapeHtml = (s='') => s.replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

function articleCard(a){
  return `<article class="card"><p class="eyebrow">${a.featured ? 'DESTAQUE · ' : ''}${formatDate(a.published_at || a.created_at)}</p><h3>${escapeHtml(a.title)}</h3><p>${escapeHtml(a.excerpt || stripHtml(a.content_html).slice(0,180))}</p><button data-article="${a.id}">Continuar lendo</button></article>`;
}

function archiveCard(i){
  return `<article class="card"><p class="eyebrow">${escapeHtml((i.item_type || 'acervo').toUpperCase())}${i.original_date ? ' · '+formatDate(i.original_date) : ''}</p><h3>${escapeHtml(i.title)}</h3><p>${escapeHtml(i.description || i.context_text || '')}</p>${i.file_url ? `<a href="${escapeHtml(i.file_url)}" target="_blank" rel="noopener">Abrir arquivo</a>` : ''}</article>`;
}

function render(){
  const q=(searchEl.value || '').trim().toLocaleLowerCase('pt-BR');
  const aa = q ? articles.filter(a => `${a.title} ${a.excerpt||''} ${stripHtml(a.content_html||'')}`.toLocaleLowerCase('pt-BR').includes(q)) : articles;
  const ai = q ? archiveItems.filter(i => `${i.title} ${i.description||''} ${i.context_text||''}`.toLocaleLowerCase('pt-BR').includes(q)) : archiveItems;
  articlesEl.innerHTML = aa.length ? aa.map(articleCard).join('') : '<p class="muted">Nenhum artigo encontrado.</p>';
  archiveEl.innerHTML = ai.length ? ai.map(archiveCard).join('') : '<p class="muted">Nenhum item encontrado no acervo.</p>';
}

async function loadContent(){
  const [{data:a,error:ae},{data:i,error:ie}] = await Promise.all([
    supabase.from('articles').select('id,title,slug,excerpt,content_html,published_at,created_at,featured,reading_time').eq('status','published').order('published_at',{ascending:false}),
    supabase.from('archive_items').select('id,title,slug,description,context_text,item_type,original_date,published_at,file_url').eq('status','published').order('published_at',{ascending:false})
  ]);
  if(ae) console.error(ae); else articles=a||[];
  if(ie) console.error(ie); else archiveItems=i||[];
  render();
}

searchEl.addEventListener('input',render);
articlesEl.addEventListener('click',e=>{
  const b=e.target.closest('[data-article]'); if(!b) return;
  const a=articles.find(x=>x.id===b.dataset.article); if(!a) return;
  readerTitle.textContent=a.title;
  readerMeta.textContent=`${formatDate(a.published_at || a.created_at)} · ${a.reading_time || 1} min de leitura`;
  readerContent.innerHTML=a.content_html || `<p>${escapeHtml(a.excerpt||'')}</p>`;
  reader.classList.remove('hidden');
  document.body.style.overflow='hidden';
});
document.querySelector('#close-reader').addEventListener('click',()=>{reader.classList.add('hidden');document.body.style.overflow='';});
reader.addEventListener('click',e=>{if(e.target===reader){reader.classList.add('hidden');document.body.style.overflow='';}});

async function syncSession(){
  const {data:{user}}=await supabase.auth.getUser();
  if(!user){loginForm.classList.remove('hidden');articleForm.classList.add('hidden');return;}
  const {data:profile}=await supabase.from('profiles').select('role').eq('id',user.id).maybeSingle();
  if(profile?.role==='admin'){loginForm.classList.add('hidden');articleForm.classList.remove('hidden');}
  else {await supabase.auth.signOut();loginStatus.textContent='Esta conta não possui permissão de administrador.';}
}

loginForm.addEventListener('submit',async e=>{
  e.preventDefault(); loginStatus.textContent='Entrando…';
  const email=document.querySelector('#email').value.trim();
  const password=document.querySelector('#password').value;
  const {error}=await supabase.auth.signInWithPassword({email,password});
  if(error){loginStatus.textContent=error.message;return;}
  loginStatus.textContent=''; await syncSession();
});

articleForm.addEventListener('submit',async e=>{
  e.preventDefault(); articleStatusText.textContent='Salvando…';
  const {data:{user}}=await supabase.auth.getUser();
  const status=document.querySelector('#article-status').value;
  const payload={title:document.querySelector('#article-title').value.trim(),slug:document.querySelector('#article-slug').value.trim(),excerpt:document.querySelector('#article-excerpt').value.trim(),content_html:document.querySelector('#article-content').value.trim().split('\n').map(p=>p?`<p>${escapeHtml(p)}</p>`:'').join(''),status,author_id:user?.id || null,published_at:status==='published'?new Date().toISOString():null};
  const {error}=await supabase.from('articles').insert(payload);
  if(error){articleStatusText.textContent=error.message;return;}
  articleStatusText.textContent='Artigo salvo.'; articleForm.reset(); await loadContent();
});

document.querySelector('#logout').addEventListener('click',async()=>{await supabase.auth.signOut();await syncSession();});
supabase.auth.onAuthStateChange(()=>syncSession());

await loadContent();
await syncSession();
