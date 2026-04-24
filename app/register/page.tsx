'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import NextLink from 'next/link';
import { motion } from 'motion/react';
import { Utensils, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // 1. Sign up user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (authData.user) {
      // 2. Create initial restaurant profile
      const slug = restaurantName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
      
      const { error: dbError } = await supabase.from('restaurants').insert({
        user_id: authData.user.id,
        name: restaurantName,
        slug,
        whatsapp_number: '',
      });

      if (dbError) {
        setError('Conta criada, mas erro ao configurar restaurante. Você pode ajustar isso no painel.');
        console.error(dbError);
      }
      
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

      <div className="flex-1 flex flex-col items-center justify-center p-6 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg bg-white p-10 md:p-14 rounded-[48px] shadow-2xl border border-[#141414]/5"
        >
          <div className="flex flex-col items-center text-center space-y-4 mb-10">
            <div className="w-16 h-16 bg-[#F27D26] rounded-3xl flex items-center justify-center text-white">
              <Utensils size={32} />
            </div>
            <h1 className="text-4xl font-black tracking-tight uppercase leading-none">CRIAR MEU <br/> <span className="text-[#F27D26]">CARDÁPIO</span></h1>
            <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em] max-w-xs">Junte-se a milhares de restaurantes vendendo pelo WhatsApp</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-6">
            <div className="space-y-4">
               <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-[#141414]/40 ml-4 mb-2 block">Nome do Restaurante</label>
                <input
                  type="text"
                  placeholder="EX: PIZZARIA DO CHEF"
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-[#141414] rounded-2xl p-5 outline-none font-bold text-xs uppercase tracking-widest transition-all"
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-[#141414]/40 ml-4 mb-2 block">Seu melhor e-mail</label>
                <input
                  type="email"
                  placeholder="SEU@EMAIL.COM"
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-[#141414] rounded-2xl p-5 outline-none font-bold text-xs uppercase tracking-widest transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-[#141414]/40 ml-4 mb-2 block">Senha de Acesso</label>
                <input
                  type="password"
                  placeholder="MÍNIMO 6 CARACTERES"
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-[#141414] rounded-2xl p-5 outline-none font-bold text-xs uppercase tracking-widest transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
            </div>

            {error && <p className="text-red-600 text-[10px] font-black uppercase tracking-widest text-center bg-red-50 p-4 rounded-2xl">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#141414] text-white font-black h-16 rounded-[32px] flex items-center justify-center gap-3 hover:bg-[#F27D26] transition-all shadow-xl disabled:opacity-50 uppercase text-xs tracking-widest mt-8"
            >
              {loading ? 'PROCESSANDO...' : 'CADASTRAR E COMEÇAR'}
              <ArrowRight size={18} />
            </button>
          </form>

          <p className="mt-10 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Já tem conta? {' '}
            <NextLink href="/login" className="text-[#F27D26] hover:underline underline-offset-4 font-black">
              Entrar agora
            </NextLink>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
