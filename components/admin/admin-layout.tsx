'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import { useRouter, usePathname } from 'next/navigation';
import NextLink from 'next/link';
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [restaurant, setRestaurant] = useState<any>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    
    if (user) {
      supabase
        .from('restaurants')
        .select('*')
        .eq('user_id', user.id)
        .single()
        .then(({ data }) => setRestaurant(data));
    }
  }, [user, loading, router]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F7F4]">
      <div className="text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Iniciando Sistema...</div>
    </div>
  );
  
  if (!user) return null;

  const navItems = [
    { label: 'Visão Geral', icon: LayoutDashboard, href: '/admin' },
    { label: 'Cardápio', icon: UtensilsCrossed, href: '/admin/menu' },
    { label: 'Configurações', icon: Settings, href: '/admin/settings' },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4] flex font-sans text-[#141414]">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 bg-white border-r border-[#141414]/10 sticky top-0 h-screen transition-all">
        <div className="h-20 px-8 border-b border-[#141414]/10 flex items-center gap-3">
          <div className="w-8 h-8 bg-[#F27D26] rounded-lg"></div>
          <span className="font-black text-xl tracking-tighter uppercase">ZAPMENU</span>
        </div>
        
        <nav className="flex-1 p-6 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <NextLink 
                key={item.href} 
                href={item.href}
                className={cn(
                  "flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                  isActive 
                    ? "bg-[#141414] text-white shadow-xl translate-x-2" 
                    : "text-gray-400 hover:text-[#141414] hover:bg-gray-50"
                )}
              >
                <item.icon size={18} className={cn(isActive ? "text-[#F27D26]" : "opacity-40")} />
                {item.label}
              </NextLink>
            );
          })}
        </nav>

        <div className="p-6 border-t border-[#141414]/10 space-y-3">
          {restaurant && (
            <NextLink 
              href={`/r/${restaurant.slug}`} 
              target="_blank"
              className="flex items-center justify-between px-6 py-4 bg-[#F27D26] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-[#F27D26]/20"
            >
              Ver Público <ExternalLink size={14} />
            </NextLink>
          )}
          <button 
            onClick={handleLogout}
            className="flex items-center gap-4 w-full px-6 py-4 text-gray-400 hover:text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
          >
            <LogOut size={18} /> Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden h-20 items-center justify-between px-6 bg-white border-b border-[#141414]/10 sticky top-0 z-40 flex">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-[#141414]">
            <Menu size={24} />
          </button>
          <span className="font-black text-xl tracking-tighter uppercase">ZAPMENU</span>
          <div className="w-10" />
        </header>

        {/* Mobile Navigation Sidebar */}
        <AnimatePresence>
          {isSidebarOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpen(false)}
                className="fixed inset-0 bg-[#141414]/60 z-50 md:hidden"
              />
              <motion.aside 
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                className="fixed top-0 left-0 bottom-0 w-80 bg-white z-[60] flex flex-col"
              >
                <div className="h-20 px-8 border-b border-[#141414]/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#F27D26] rounded-lg"></div>
                    <span className="font-black text-xl tracking-tighter uppercase">ZAPMENU</span>
                  </div>
                  <button onClick={() => setIsSidebarOpen(false)} className="p-2">
                    <X size={24} />
                  </button>
                </div>
                <nav className="flex-1 p-6 space-y-2">
                  {navItems.map((item) => (
                    <NextLink 
                      key={item.href} 
                      href={item.href}
                      onClick={() => setIsSidebarOpen(false)}
                      className={cn(
                        "flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                        pathname === item.href ? "bg-[#141414] text-white shadow-xl" : "text-gray-400"
                      )}
                    >
                      <item.icon size={18} /> {item.label}
                    </NextLink>
                  ))}
                </nav>
                <div className="p-6 border-t border-[#141414]/10">
                   {restaurant && (
                    <NextLink 
                      href={`/r/${restaurant.slug}`} 
                      target="_blank"
                      className="flex items-center justify-center gap-3 w-full py-5 bg-[#F27D26] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl"
                    >
                      Meu Cardápio <ExternalLink size={16} />
                    </NextLink>
                  )}
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        <main className="p-6 md:p-12 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
