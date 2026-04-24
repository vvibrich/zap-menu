'use client';

import { useState, useEffect, use } from 'react';
import { supabase } from '@/lib/supabase';
import { formatCurrency, generateWhatsAppLink, cn } from '@/lib/utils';
import { useCart, CartItem } from '@/hooks/use-cart';
import { ShoppingCart, X, Plus, Minus, Search, Info, MapPin, Home, Bike } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import NextLink from 'next/link';

type Restaurant = {
  id: string;
  name: string;
  slug: string;
  logo_url: string;
  whatsapp_number: string;
  address: string;
  colors: { primary: string; secondary: string };
  working_hours: { open: string; close: string };
};

type Category = { id: string; name: string };

type Product = {
  id: string;
  category_id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  is_available: boolean;
};

type DeliveryZone = { id: string; neighborhood: string; fee: number };

export default function RestaurantMenu({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Checkout state
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'dinheiro' | 'pix' | 'cartao_entrega'>('pix');
  const [observations, setObservations] = useState('');
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('delivery');
  const [selectedZoneId, setSelectedZoneId] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');

  const { items, addItem, updateQuantity, total, clearCart } = useCart();

  const selectedZone = deliveryZones.find(z => z.id === selectedZoneId) ?? null;
  const deliveryFee = deliveryType === 'delivery' && selectedZone ? selectedZone.fee : 0;
  const grandTotal = total + deliveryFee;

  useEffect(() => {
    async function fetchData() {
      const { data: restData } = await supabase
        .from('restaurants')
        .select('*')
        .eq('slug', slug)
        .single();

      if (restData) {
        setRestaurant(restData);

        const { data: catsData } = await supabase
          .from('categories')
          .select('*')
          .eq('restaurant_id', restData.id)
          .order('order_index');
        setCategories(catsData || []);
        if (catsData && catsData.length > 0) setActiveCategory(catsData[0].id);

        const { data: prodsData } = await supabase
          .from('products')
          .select('*')
          .eq('restaurant_id', restData.id)
          .eq('is_available', true);
        setProducts(prodsData || []);

        const { data: zonesData } = await supabase
          .from('delivery_zones')
          .select('*')
          .eq('restaurant_id', restData.id)
          .order('neighborhood');
        setDeliveryZones(zonesData || []);
        if (zonesData && zonesData.length > 0) setDeliveryType('delivery');
      }
      setLoading(false);
    }
    fetchData();
  }, [slug]);

  const filteredProducts = products.filter(p =>
    (activeCategory ? p.category_id === activeCategory : true) &&
    (searchTerm ? p.name.toLowerCase().includes(searchTerm.toLowerCase()) : true)
  );

  const handleFinishOrder = async () => {
    if (!customerName.trim()) { alert('Por favor, informe seu nome.'); return; }
    if (items.length === 0) { alert('Seu carrinho está vazio.'); return; }
    if (deliveryType === 'delivery' && !selectedZoneId) { alert('Selecione o bairro de entrega.'); return; }
    if (deliveryType === 'delivery' && !customerAddress.trim()) { alert('Por favor, informe seu endereço completo.'); return; }

    let message = `*Novo Pedido - ${restaurant?.name}*\n\n`;
    message += `*Cliente:* ${customerName}\n`;

    if (deliveryType === 'delivery') {
      message += `*Tipo:* 🛵 Entrega\n`;
      message += `*Bairro:* ${selectedZone?.neighborhood}\n`;
      message += `*Endereço:* ${customerAddress}\n`;
      message += `*Taxa de Entrega:* ${selectedZone?.fee === 0 ? 'Grátis' : formatCurrency(selectedZone?.fee ?? 0)}\n`;
    } else {
      message += `*Tipo:* 🏠 Retirada no Local\n`;
    }

    message += `*Pagamento:* ${paymentMethod === 'pix' ? 'Pix' : paymentMethod === 'dinheiro' ? 'Dinheiro' : 'Cartão na Entrega'}\n`;
    if (observations) message += `*Obs:* ${observations}\n`;
    message += `\n*Itens:*\n`;
    items.forEach(item => {
      message += `${item.quantity}x ${item.name} - ${formatCurrency(item.price * item.quantity)}\n`;
    });
    message += `\n*Subtotal: ${formatCurrency(total)}*`;
    if (deliveryType === 'delivery' && deliveryFee > 0) {
      message += `\n*Taxa de Entrega: ${formatCurrency(deliveryFee)}*`;
    }
    message += `\n*Total Geral: ${formatCurrency(grandTotal)}*`;

    try {
      await supabase.from('orders').insert({
        restaurant_id: restaurant?.id,
        customer_name: customerName,
        items: items,
        total_price: grandTotal,
        payment_method: paymentMethod,
        status: 'pending',
      });
    } catch (e) {
      console.error('Failed to save order', e);
    }

    const link = generateWhatsAppLink(restaurant?.whatsapp_number || '', message);
    window.location.href = link;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F8F7F4]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F27D26]" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-[#F8F7F4]">
        <h1 className="text-2xl font-black tracking-tight mb-2 uppercase">Não Encontrado</h1>
        <p className="text-[#141414]/60 font-medium">Link de cardápio incorreto ou restaurante inexistente.</p>
        <NextLink href="/" className="mt-8 text-xs font-black uppercase tracking-widest bg-[#141414] text-white px-8 py-3">Voltar ao Início</NextLink>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen shadow-2xl relative pb-24 border-x border-[#141414]/5">
      {/* Header */}
      <div className="p-8 pb-4">
        <div className="flex justify-between items-start mb-6">
          <div className="w-16 h-16 bg-[#F27D26] rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-lg overflow-hidden">
            {restaurant.logo_url
              ? <Image src={restaurant.logo_url} alt={restaurant.name} width={64} height={64} className="rounded-2xl object-cover h-full w-full" referrerPolicy="no-referrer" />
              : restaurant.name.charAt(0).toUpperCase()
            }
          </div>
          <div className="flex gap-2">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-[#141414]">
              <Info size={18} />
            </div>
          </div>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-[#141414] uppercase">{restaurant.name}</h1>
        <div className="flex items-center gap-2 mt-2">
          <p className="text-[10px] text-green-600 font-bold uppercase tracking-[0.1em] flex items-center gap-1.5 bg-green-50 px-3 py-1 rounded-full">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Aberto agora
          </p>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            {restaurant.working_hours.open} — {restaurant.working_hours.close}
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="px-8 mb-8 mt-2">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#F27D26] transition-colors" size={18} />
          <input
            type="text"
            placeholder="O QUE VOCÊ VAI PEDIR HOJE?"
            className="w-full bg-gray-100/80 border-2 border-transparent focus:border-[#141414] rounded-2xl py-4 pl-12 pr-4 outline-none font-bold text-xs uppercase tracking-widest transition-all"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Categories */}
      {!searchTerm && (
        <div className="flex overflow-x-auto px-8 gap-3 no-scrollbar mb-8">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                'whitespace-nowrap px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all',
                activeCategory === cat.id
                  ? 'bg-[#141414] text-white shadow-xl translate-y-[-2px]'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Products */}
      <div className="px-8 space-y-6">
        {filteredProducts.length === 0 ? (
          <div className="py-20 text-center text-gray-400 font-bold uppercase text-[10px] tracking-widest">Nenhum prato encontrado</div>
        ) : (
          filteredProducts.map(p => (
            <motion.div layout key={p.id} className="flex gap-4 group cursor-pointer">
              <div className="flex-1 min-w-0">
                <h3 className="font-black text-sm uppercase tracking-tight text-[#141414] group-hover:text-[#F27D26] transition-colors">{p.name}</h3>
                <p className="text-[10px] text-gray-500 font-medium line-clamp-2 mt-1 leading-relaxed">{p.description}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="font-black text-sm text-[#F27D26]">{formatCurrency(p.price)}</span>
                  <button
                    onClick={() => addItem({ id: p.id, name: p.name, price: p.price, quantity: 1, options: [] })}
                    className="bg-[#141414] text-white p-1.5 rounded-xl hover:bg-[#F27D26] transition-all transform group-active:scale-95 shadow-md"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>
              <div className="relative h-24 w-24 rounded-2xl overflow-hidden flex-shrink-0 bg-gray-50 border border-gray-100 group-hover:scale-[1.02] transition-transform">
                {p.image_url ? (
                  <Image src={p.image_url} alt={p.name} fill className="object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-200 bg-gray-50">
                    <Utensils size={32} />
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Floating Cart Button */}
      <AnimatePresence>
        {items.length > 0 && !isCartOpen && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-[340px] px-4 z-50"
          >
            <button
              onClick={() => setIsCartOpen(true)}
              className="w-full bg-[#25D366] h-16 rounded-[40px] shadow-2xl flex items-center justify-between px-8 text-white hover:scale-[1.02] transition-all active:scale-95 border-b-4 border-green-700"
            >
              <div className="flex items-center gap-3">
                <span className="bg-white/20 px-2 py-1 rounded-lg text-[10px] font-black">{items.reduce((a, b) => a + b.quantity, 0)}</span>
                <span className="font-black text-xs uppercase tracking-widest">Ver Sacola</span>
              </div>
              <span className="font-black text-sm">{formatCurrency(grandTotal)}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart / Checkout Modal */}
      <AnimatePresence>
        {isCartOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#141414]/90 z-[60] flex items-end justify-center sm:p-4"
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-white w-full max-w-md rounded-t-[40px] sm:rounded-[40px] h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="p-8 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
                <h2 className="text-2xl font-black uppercase tracking-tight">Sua Sacola</h2>
                <button onClick={() => setIsCartOpen(false)} className="bg-gray-100 p-3 rounded-2xl hover:bg-gray-200 transition">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                {/* Items */}
                {items.map((item, idx) => (
                  <div key={idx} className="flex gap-4 justify-between items-start">
                    <div className="flex-1">
                      <p className="font-black text-sm uppercase text-[#141414]">{item.name}</p>
                      <p className="text-xs font-bold text-[#F27D26] mt-1">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                    <div className="flex items-center gap-4 bg-gray-100 rounded-2xl px-4 py-2">
                      <button onClick={() => updateQuantity(idx, item.quantity - 1)} className="text-[#141414] hover:text-[#F27D26] transition-colors">
                        <Minus size={16} />
                      </button>
                      <span className="font-black text-xs w-4 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(idx, item.quantity + 1)} className="text-[#141414] hover:text-[#F27D26] transition-colors">
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                ))}

                {items.length === 0 && (
                  <div className="text-center py-10 font-bold uppercase text-[10px] tracking-widest text-gray-400">Sacola vazia</div>
                )}

                {/* Checkout Form */}
                {items.length > 0 && (
                  <div className="space-y-6 pt-8 border-t border-gray-100">
                    <h3 className="font-black text-xl uppercase tracking-tight">Check-out</h3>

                    {/* Name */}
                    <input
                      type="text"
                      className="w-full bg-gray-50 border-2 border-transparent focus:border-[#141414] rounded-2xl p-4 outline-none font-bold text-xs uppercase tracking-widest"
                      placeholder="SEU NOME"
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                    />

                    {/* Delivery type toggle */}
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#141414]/40 ml-1 mb-3 block">Tipo de Entrega</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setDeliveryType('pickup')}
                          className={cn(
                            'flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all',
                            deliveryType === 'pickup'
                              ? 'border-[#141414] bg-[#141414] text-white'
                              : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'
                          )}
                        >
                          <Home size={20} />
                          <span className="text-[9px] font-black uppercase tracking-widest">Retirar no Local</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeliveryType('delivery')}
                          disabled={deliveryZones.length === 0}
                          className={cn(
                            'flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all',
                            deliveryType === 'delivery'
                              ? 'border-[#F27D26] bg-[#F27D26] text-white'
                              : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200',
                            deliveryZones.length === 0 && 'opacity-40 cursor-not-allowed'
                          )}
                        >
                          <Bike size={20} />
                          <span className="text-[9px] font-black uppercase tracking-widest">
                            {deliveryZones.length === 0 ? 'Sem Entrega' : 'Entrega'}
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Delivery fields */}
                    <AnimatePresence>
                      {deliveryType === 'delivery' && deliveryZones.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-3 overflow-hidden"
                        >
                          {/* Neighborhood selector */}
                          <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-[#141414]/40 ml-1 mb-2 block">Bairro</label>
                            <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                              {deliveryZones.map(zone => (
                                <button
                                  key={zone.id}
                                  type="button"
                                  onClick={() => setSelectedZoneId(zone.id)}
                                  className={cn(
                                    'flex items-center justify-between px-4 py-3 rounded-2xl border-2 transition-all text-left',
                                    selectedZoneId === zone.id
                                      ? 'border-[#141414] bg-[#141414] text-white'
                                      : 'border-gray-100 bg-gray-50 text-gray-600 hover:border-gray-200'
                                  )}
                                >
                                  <div className="flex items-center gap-2">
                                    <MapPin size={14} className={selectedZoneId === zone.id ? 'text-[#F27D26]' : 'text-gray-400'} />
                                    <span className="font-black text-[10px] uppercase tracking-widest">{zone.neighborhood}</span>
                                  </div>
                                  <span className={cn('font-black text-[10px]', selectedZoneId === zone.id ? 'text-[#F27D26]' : 'text-gray-400')}>
                                    {zone.fee === 0 ? 'Grátis' : formatCurrency(zone.fee)}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Address input */}
                          <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-[#141414]/40 ml-1 mb-2 block">Endereço Completo</label>
                            <input
                              type="text"
                              className="w-full bg-gray-50 border-2 border-transparent focus:border-[#141414] rounded-2xl p-4 outline-none font-bold text-xs uppercase tracking-widest"
                              placeholder="RUA, Nº, COMPLEMENTO"
                              value={customerAddress}
                              onChange={e => setCustomerAddress(e.target.value)}
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Payment */}
                    <select
                      className="w-full bg-gray-50 border-2 border-transparent focus:border-[#141414] rounded-2xl p-4 outline-none font-bold text-xs uppercase tracking-widest cursor-pointer"
                      value={paymentMethod}
                      onChange={e => setPaymentMethod(e.target.value as any)}
                    >
                      <option value="pix">PIX (Rápido)</option>
                      <option value="dinheiro">Dinheiro</option>
                      <option value="cartao_entrega">Cartão na Entrega</option>
                    </select>

                    {/* Observations */}
                    <textarea
                      className="w-full bg-gray-50 border-2 border-transparent focus:border-[#141414] rounded-2xl p-4 outline-none font-bold text-xs uppercase tracking-widest resize-none"
                      placeholder="OBSERVAÇÕES (OPCIONAL)"
                      rows={3}
                      value={observations}
                      onChange={e => setObservations(e.target.value)}
                    />
                  </div>
                )}
              </div>

              {/* Footer with totals + CTA */}
              <div className="p-8 border-t border-gray-100 bg-gray-50/50 flex-shrink-0 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-gray-400 uppercase tracking-widest text-[10px]">Subtotal</span>
                  <span className="font-black text-[#141414]">{formatCurrency(total)}</span>
                </div>

                {deliveryType === 'delivery' && selectedZone && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-gray-400 uppercase tracking-widest text-[10px]">
                      Entrega · {selectedZone.neighborhood}
                    </span>
                    <span className="font-black text-[#F27D26]">
                      {selectedZone.fee === 0 ? 'Grátis' : formatCurrency(selectedZone.fee)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                  <span className="font-black uppercase tracking-widest text-[10px] text-gray-400">Total Geral</span>
                  <span className="text-2xl font-black text-[#141414]">{formatCurrency(grandTotal)}</span>
                </div>

                <button
                  onClick={handleFinishOrder}
                  disabled={items.length === 0}
                  className="w-full bg-[#25D366] text-white font-black h-16 rounded-[40px] flex items-center justify-center gap-3 hover:scale-[1.02] transition-all active:scale-95 shadow-xl disabled:opacity-50 border-b-4 border-green-700 uppercase p-4 text-xs tracking-widest"
                >
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.187-2.59-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217s.231.001.332.005c.109.004.258-.041.404.311.16.389.549 1.343.597 1.444.048.101.08.217.014.347-.067.13-.101.217-.202.333-.101.116-.212.26-.303.347-.101.096-.206.201-.089.404.117.203.522.862 1.121 1.396.772.69 1.419.905 1.622 1.006.203.101.32.084.44-.055.12-.139.515-.598.652-.803.137-.205.274-.173.463-.104.19.069 1.2.564 1.407.669.207.106.346.157.396.244.05.087.05.506-.094.911z" />
                  </svg>
                  Confirmar Pedido
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #141414; border-radius: 10px; }
      `}</style>
    </div>
  );
}

function Utensils({ size, className }: { size: number; className?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
      <path d="M7 2v20" />
      <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
    </svg>
  );
}
