import { login } from '../actions'

export default function Login({ searchParams }: { searchParams: { erro?: string } }) {
  return <div className="mx-auto max-w-md px-5 py-20"><h1 className="font-serif text-4xl">Administração</h1><p className="mt-3 text-sm text-stone-500">Acesso restrito.</p>{searchParams.erro && <p className="mt-5 text-sm text-red-600">E-mail ou senha inválidos.</p>}<form action={login} className="mt-8 space-y-4"><label className="block text-sm">E-mail<input name="email" type="email" required className="mt-2 w-full border border-stone-300 bg-transparent px-4 py-3 outline-none dark:border-stone-700" /></label><label className="block text-sm">Senha<input name="password" type="password" required className="mt-2 w-full border border-stone-300 bg-transparent px-4 py-3 outline-none dark:border-stone-700" /></label><button className="w-full bg-stone-900 px-4 py-3 text-white dark:bg-white dark:text-stone-950">Entrar</button></form></div>
}
