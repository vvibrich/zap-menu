'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import NextLink from 'next/link';
import { motion } from 'motion/react';
import { LogIn, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError('Credenciais inválidas. Verifique seu e-mail e senha.');
      setLoading(false);
    } else {
      router.push('/admin');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4] flex flex-col font-sans text-[#141414]">
      {/* Mini Header */}
      <div className="h-20 px-8 flex items-center border-b border-[#141414]/10 bg-white">
        <NextLink href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#F27D26] rounded-lg"></div>
          <span className="font-black text-xl tracking-tighter uppercase">ZAPMENU</span>
        </NextLink>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white p-10 rounded-[48px] shadow-2xl border border-[#141414]/5"
        >
          <div className="flex flex-col items-center text-center space-y-4 mb-10">
            <div className="w-16 h-16 bg-[#141414] rounded-3xl flex items-center justify-center text-[#F27D26]">
              <LogIn size={32} />
            </div>
            <h1 className="text-4xl font-black tracking-tight uppercase leading-none">BEM-VINDO <br/> <span className="text-[#F27D26]">DE VOLTA</span></h1>
            <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em]">Acesse seu gerenciador de cardápio</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="group">
                <input
                  type="email"
                  placeholder="SEU E-MAIL"
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-[#141414] rounded-2xl p-5 outline-none font-bold text-xs uppercase tracking-widest transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="group">
                <input
                  type="password"
                  placeholder="SUA SENHA"
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-[#141414] rounded-2xl p-5 outline-none font-bold text-xs uppercase tracking-widest transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && <p className="text-red-600 text-[10px] font-black uppercase tracking-widest text-center">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#141414] text-white font-black h-16 rounded-[32px] flex items-center justify-center gap-3 hover:bg-[#F27D26] transition-all shadow-xl disabled:opacity-50 uppercase text-xs tracking-widest"
            >
              {loading ? 'AUTENTICANDO...' : 'ACESSAR AGORA'}
              <ArrowRight size={18} />
            </button>
          </form>

          <p className="mt-10 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Não tem conta? {' '}
            <NextLink href="/register" className="text-[#F27D26] hover:underline underline-offset-4 font-black">
              Criar agora
            </NextLink>
          </p>
        </motion.div>
        
        <div className="mt-12 text-[10px] font-bold uppercase tracking-[0.3em] text-[#141414]/20">
          ZAPMENU TECHNOLOGIES © 2026
        </div>
      </div>
    </div>
  );
}
