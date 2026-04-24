'use client';

import { Link as LinkIcon, Zap } from 'lucide-react';
import NextLink from 'next/link';

export function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F4] font-sans text-[#141414]">
      <header className="px-6 lg:px-12 h-20 flex items-center border-b border-[#141414]/10 bg-white sticky top-0 z-50">
        <NextLink href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#F27D26] rounded-lg"></div>
          <span className="font-black text-2xl tracking-tighter uppercase">ZAPMENU</span>
        </NextLink>
        <nav className="ml-auto flex gap-4 sm:gap-8 items-center">
          <NextLink href="/login" className="text-xs font-bold uppercase tracking-widest hover:text-[#F27D26] transition-colors">
            Entrar
          </NextLink>
          <NextLink href="/register" className="text-xs font-bold uppercase tracking-widest border-2 border-[#141414] px-6 py-2 hover:bg-[#141414] hover:text-white transition-all">
            Criar Grátis
          </NextLink>
        </nav>
      </header>

      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-40">
          <div className="container px-6 lg:px-12 mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <span className="bg-[#F27D26] text-white font-bold text-[10px] px-3 py-1 uppercase tracking-[0.2em] rounded-full inline-block">
                  Lançamento 2026
                </span>
                <h1 className="text-[64px] md:text-[84px] font-black leading-[0.85] tracking-tighter">
                  MENU <br/> <span className="text-[#F27D26]">VIVO</span> PRO <br/> WHATSAPP
                </h1>
                <p className="text-xl text-[#141414]/70 max-w-md font-medium leading-relaxed">
                  Transforme seu cardápio em uma máquina de vendas automática. Receba pedidos direto no WhatsApp sem taxas.
                </p>
                <div className="flex flex-wrap gap-4 pt-4">
                  <NextLink href="/register" className="inline-flex h-14 items-center justify-center bg-[#141414] px-10 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-[#F27D26]">
                    Começar Agora
                  </NextLink>
                  <div className="flex gap-8 items-center px-4">
                    <div className="flex flex-col">
                      <span className="text-3xl font-black">0%</span>
                      <span className="text-[10px] font-bold uppercase opacity-50 tracking-widest">Taxa</span>
                    </div>
                    <div className="w-px h-10 bg-[#141414]/10"></div>
                    <div className="flex flex-col">
                      <span className="text-3xl font-black text-[#F27D26]">15s</span>
                      <span className="text-[10px] font-bold uppercase opacity-50 tracking-widest">Agilidade</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="hidden lg:flex justify-center relative">
                <div className="absolute w-[400px] h-[400px] bg-[#F27D26]/10 rounded-full blur-3xl -z-10"></div>
                <div className="relative w-[340px] h-[640px] bg-[#141414] rounded-[48px] p-3 shadow-2xl border-8 border-[#141414]">
                  <div className="w-full h-full bg-white rounded-[38px] overflow-hidden flex flex-col p-6">
                    <div className="w-12 h-12 bg-[#F27D26] rounded-xl flex items-center justify-center text-white text-xl font-black mb-4">P</div>
                    <h2 className="text-2xl font-black tracking-tight mb-1">Restaurante Di Nonna</h2>
                    <p className="text-[10px] text-green-600 font-bold uppercase tracking-widest flex items-center gap-1 mb-6">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span> Aberto agora
                    </p>
                    <div className="space-y-4">
                      {[1, 2].map((i) => (
                        <div key={i} className="flex gap-3 py-3 border-b border-gray-100">
                          <div className="flex-1">
                            <div className="h-3 w-2/3 bg-gray-200 rounded mb-2"></div>
                            <div className="h-2 w-full bg-gray-100 rounded mb-2"></div>
                            <div className="h-3 w-1/4 bg-[#F27D26]/20 rounded"></div>
                          </div>
                          <div className="w-14 h-14 bg-gray-100 rounded-lg"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="absolute top-6 left-1/2 -translate-x-1/2 w-20 h-6 bg-[#141414] rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <section className="w-full py-24 bg-white border-t border-[#141414]/10">
          <div className="container px-6 lg:px-12 mx-auto">
            <div className="grid gap-16 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { title: "Link Único", desc: "Seu cardápio pronto para a bio do Instagram.", icon: LinkIcon, color: "bg-[#F27D26]/10 text-[#F27D26]" },
                { title: "Zap Direto", desc: "Pedidos formatados direto no WhatsApp.", icon: Zap, color: "bg-green-100 text-green-600" },
                { title: "QR Code", desc: "QR Code gratuito para suas mesas.", icon: LinkIcon, color: "bg-blue-100 text-blue-600" }
              ].map((feature, i) => (
                <div key={i} className="flex flex-col space-y-4">
                  <div className={cn("w-12 h-12 flex items-center justify-center rounded-xl", feature.color)}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-tight">{feature.title}</h3>
                  <p className="text-gray-500 font-medium leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="h-20 px-6 lg:px-12 border-t border-[#141414]/10 flex items-center justify-between bg-white text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">
        <span>© 2026 ZAPMENU TECHNOLOGIES</span>
        <div className="hidden sm:flex gap-6">
          <span>Termos</span>
          <span>Privacidade</span>
          <span>Parcerias</span>
        </div>
      </footer>
    </div>
  );
}

// Helper to keep it clean, though defined in lib/utils usually
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
