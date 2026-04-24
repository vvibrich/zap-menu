'use client';

import AdminLayout from '@/components/admin/admin-layout';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import { Users, TrendingUp, ChevronRight, Utensils, Settings, Share2, Plus, QrCode, AlertCircle } from 'lucide-react';
import NextLink from 'next/link';
import { motion } from 'motion/react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ products: 0, categories: 0, orders: 0 });
  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;

      const { data: rest } = await supabase.from('restaurants').select('*').eq('user_id', user.id).single();
      setRestaurant(rest);

      if (rest) {
        const [pCount, cCount, oCount] = await Promise.all([
          supabase.from('products').select('*', { count: 'exact', head: true }).eq('restaurant_id', rest.id),
          supabase.from('categories').select('*', { count: 'exact', head: true }).eq('restaurant_id', rest.id),
          supabase.from('orders').select('*', { count: 'exact', head: true }).eq('restaurant_id', rest.id)
        ]);

        setStats({
          products: pCount.count || 0,
          categories: cCount.count || 0,
          orders: oCount.count || 0
        });
      }
      setLoading(false);
    }
    fetchData();
  }, [user]);

  if (loading) return (
    <AdminLayout>
       <div className="animate-pulse space-y-8">
        <div className="h-10 w-48 bg-gray-200 rounded-lg"></div>
        <div className="grid md:grid-cols-3 gap-6">
            {[1,2,3].map(i => <div key={i} className="h-32 bg-gray-100 rounded-3xl"></div>)}
        </div>
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <div className="space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase leading-none">
              Bem-vindo, <br/>
              <span className="text-[#F27D26]">{restaurant?.name || 'Chef'}</span>
            </h1>
            <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.3em] mt-4">Painel de Controle v1.0</p>
          </div>
          
          <div className="flex gap-3">
            {!restaurant && (
               <NextLink href="/admin/settings" className="flex items-center gap-3 px-8 py-4 bg-[#F27D26] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#141414] transition-all shadow-xl">
                <Settings size={16} /> Configurar Restaurante
              </NextLink>
            )}
            {restaurant && (
              <>
                <button className="flex items-center gap-3 px-6 py-4 bg-white border border-[#141414]/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all shadow-sm">
                  <Share2 size={16} /> Compartilhar
                </button>
                <NextLink href="/admin/menu" className="flex items-center gap-3 px-8 py-4 bg-[#141414] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#F27D26] transition-all shadow-xl">
                  <Plus size={16} /> Novo Item
                </NextLink>
              </>
            )}
          </div>
        </div>

        {!restaurant && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#F27D26]/10 border-2 border-[#F27D26] p-10 rounded-[48px] flex flex-col md:flex-row items-center gap-8 shadow-2xl"
          >
            <div className="w-20 h-20 bg-[#F27D26] rounded-[32px] flex items-center justify-center text-white shrink-0">
               <AlertCircle size={40} />
            </div>
            <div className="text-center md:text-left space-y-2">
              <h3 className="text-2xl font-black uppercase tracking-tight text-[#141414]">Complete seu Cadastro!</h3>
              <p className="text-sm font-bold text-[#141414]/60 uppercase tracking-widest leading-relaxed">
                Ainda não encontramos um perfil de restaurante vinculado à sua conta. <br/>
                Clique no botão ao lado para configurar seu nome, WhatsApp e endereço.
              </p>
            </div>
            <NextLink href="/admin/settings" className="md:ml-auto px-10 h-16 bg-[#141414] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center hover:bg-[#F27D26] transition-all whitespace-nowrap">
              Configurar Agora
            </NextLink>
          </motion.div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Total de Pratos', value: stats.products, icon: Utensils, color: 'bg-blue-50 text-blue-600' },
            { label: 'Categorias', value: stats.categories, icon: TrendingUp, color: 'bg-[#F27D26]/10 text-[#F27D26]' },
            { label: 'Pedidos Realizados', value: stats.orders, icon: Users, color: 'bg-green-50 text-green-600' },
          ].map((stat, i) => (
            <motion.div 
              whileHover={{ y: -4 }}
              key={i} 
              className="bg-white p-8 rounded-[32px] border border-[#141414]/5 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex justify-between items-start mb-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.color}`}>
                  <stat.icon size={24} />
                </div>
                <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest group-hover:text-[#141414] transition-colors">Relatório</span>
              </div>
              <div className="flex flex-col">
                <span className="text-4xl font-black tracking-tight">{stat.value}</span>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{stat.label}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {restaurant && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-1 border-2 border-[#141414] rounded-[32px] overflow-hidden"
          >
            <div className="bg-[#F8F7F4] p-8 rounded-[28px] flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-white border-2 border-[#141414] rounded-[24px] flex items-center justify-center font-black text-2xl">
                  {restaurant.name?.charAt(0)}
                </div>
                <div>
                  <h3 className="font-black text-lg uppercase tracking-tight">Seu link público está ativo!</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Divulgue em seu Instagram ou WhatsApp</p>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-white p-2 pl-6 rounded-2xl border border-[#141414]/10 w-full md:w-auto">
                <code className="text-[10px] font-black uppercase text-[#F27D26]">zapmenu.com/r/{restaurant.slug}</code>
                <a 
                  href={`/r/${restaurant.slug}`} 
                  target="_blank" 
                  className="px-6 py-3 bg-[#141414] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#F27D26] transition-all"
                >
                  Visualizar
                </a>
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <div className="bg-[#141414] text-white p-10 rounded-[40px] shadow-2xl relative overflow-hidden">
            <div className="absolute top-[-20px] right-[-20px] w-48 h-48 bg-[#F27D26]/20 rounded-full blur-[80px]"></div>
            <h2 className="text-2xl font-black uppercase tracking-tighter mb-8">Atalho Rápido</h2>
            <div className="grid gap-4">
              <NextLink href="/admin/settings" className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all group">
                <div className="flex items-center gap-4">
                  <QrCode className="text-[#F27D26]" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Configurar QR Code</span>
                </div>
                <ChevronRight size={18} className="opacity-40 group-hover:translate-x-1 transition-transform" />
              </NextLink>
              <NextLink href="/admin/menu" className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all group">
                <div className="flex items-center gap-4">
                  <Utensils className="text-[#F27D26]" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Gerenciar Categorias</span>
                </div>
                <ChevronRight size={18} className="opacity-40 group-hover:translate-x-1 transition-transform" />
              </NextLink>
            </div>
          </div>

          {/* Info Card */}
          <div className="border-4 border-dashed border-[#141414]/10 rounded-[40px] p-10 flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-[#141414]/20">
              <Users size={40} />
            </div>
            <div>
               <h3 className="text-xl font-black uppercase tracking-tight">Novos Recursos</h3>
               <p className="text-gray-400 font-medium text-sm mt-2 max-w-[280px]">Estamos preparando um sistema de inteligência artificial para sugerir pratos!</p>
            </div>
            <button className="text-[10px] font-black uppercase tracking-widest text-[#F27D26] hover:underline underline-offset-8 transition-all">Ver Roadmap 2026</button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
