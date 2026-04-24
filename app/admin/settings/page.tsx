'use client';

import AdminLayout from '@/components/admin/admin-layout';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import { Save, AlertCircle, Store, Plus, Trash2, MapPin, Bike } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatCurrency } from '@/lib/utils';

type DeliveryZone = { id: string; neighborhood: string; fee: number };

export default function SettingsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [restaurant, setRestaurant] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    whatsapp_number: '',
    address: '',
    logo_url: '',
    working_hours: { open: '08:00', close: '22:00' },
  });

  // Delivery zones state
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [newNeighborhood, setNewNeighborhood] = useState('');
  const [newFee, setNewFee] = useState('');
  const [addingZone, setAddingZone] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    const { data } = await supabase.from('restaurants').select('*').eq('user_id', user?.id).single();
    if (data) {
      setRestaurant(data);
      setFormData({
        name: data.name,
        slug: data.slug,
        whatsapp_number: data.whatsapp_number,
        address: data.address || '',
        logo_url: data.logo_url || '',
        working_hours: data.working_hours || { open: '08:00', close: '22:00' },
      });
      await fetchZones(data.id);
    }
    setLoading(false);
  };

  const fetchZones = async (restaurantId: string) => {
    const { data } = await supabase
      .from('delivery_zones')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('neighborhood');
    setZones(data || []);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (user) {
      const timeout = setTimeout(fetchSettings, 0);
      return () => clearTimeout(timeout);
    }
  }, [user]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const payload = {
      ...formData,
      user_id: user.id,
      ...(restaurant?.id ? { id: restaurant.id } : {}),
    };
    const { data, error } = await supabase
      .from('restaurants')
      .upsert(payload, { onConflict: 'user_id' })
      .select()
      .single();
    if (error) {
      alert('Erro ao salvar: ' + error.message);
    } else {
      setRestaurant(data);
      alert('Configurações salvas com sucesso!');
    }
    setSaving(false);
  };

  const handleAddZone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant) return;
    setAddingZone(true);
    const { error } = await supabase.from('delivery_zones').insert({
      restaurant_id: restaurant.id,
      neighborhood: newNeighborhood.trim(),
      fee: parseFloat(newFee),
    });
    if (error) {
      alert('Erro ao adicionar bairro: ' + error.message);
    } else {
      setNewNeighborhood('');
      setNewFee('');
      await fetchZones(restaurant.id);
    }
    setAddingZone(false);
  };

  const handleDeleteZone = async (id: string) => {
    await supabase.from('delivery_zones').delete().eq('id', id);
    setZones(z => z.filter(z => z.id !== id));
  };

  if (loading)
    return (
      <AdminLayout>
        <div className="py-20 flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#F27D26]/20 border-t-[#F27D26] rounded-full animate-spin" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Carregando Configurações...</span>
        </div>
      </AdminLayout>
    );

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-12 pb-24">
        <header>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase leading-none">
            CONFIGURAÇÕES <br /><span className="text-[#F27D26]">GERAIS</span>
          </h1>
          <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.3em] mt-4">Ajuste os dados do seu restaurante</p>
        </header>

        {/* ── Restaurant Info Form ────────────────────────────────────── */}
        <form onSubmit={handleUpdate} className="space-y-8">
          <div className="bg-white p-10 rounded-[48px] shadow-2xl border border-[#141414]/5 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="md:col-span-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#141414]/40 ml-4 mb-2 block">Nome Fantasia</label>
                <input
                  required
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-[#141414] rounded-2xl p-5 outline-none font-bold text-xs uppercase tracking-widest transition-all"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-[#141414]/40 ml-4 mb-2 block">Slug Personalizado</label>
                <div className="relative group">
                  <input
                    required
                    className="w-full bg-gray-50 border-2 border-transparent focus:border-[#141414] rounded-2xl p-5 outline-none font-bold text-xs uppercase tracking-widest transition-all font-mono"
                    value={formData.slug}
                    onChange={e => setFormData({ ...formData, slug: e.target.value.replace(/\s+/g, '-').toLowerCase() })}
                  />
                  <Store size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#F27D26] transition-colors" />
                </div>
                <p className="text-[9px] text-[#F27D26] mt-3 font-black px-4 bg-[#F27D26]/10 py-1.5 rounded-full inline-block uppercase tracking-widest">
                  SEUSITE.COM/R/{formData.slug}
                </p>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-[#141414]/40 ml-4 mb-2 block">WhatsApp (DDD + NÚMERO)</label>
                <input
                  required
                  placeholder="11988887777"
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-[#141414] rounded-2xl p-5 outline-none font-bold text-xs uppercase tracking-widest transition-all"
                  value={formData.whatsapp_number}
                  onChange={e => setFormData({ ...formData, whatsapp_number: e.target.value.replace(/\D/g, '') })}
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#141414]/40 ml-4 mb-2 block">URL Logotipo / Banner Principal</label>
                <input
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-[#141414] rounded-2xl p-5 outline-none font-bold text-xs uppercase tracking-widest transition-all"
                  placeholder="HTTPS://..."
                  value={formData.logo_url}
                  onChange={e => setFormData({ ...formData, logo_url: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#141414]/40 ml-4 mb-2 block">Endereço Completo</label>
                <input
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-[#141414] rounded-2xl p-5 outline-none font-bold text-xs uppercase tracking-widest transition-all"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              <div className="md:col-span-2 grid grid-cols-2 gap-6 pt-10 border-t-2 border-dashed border-gray-100 mt-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#141414]/40 ml-4 mb-2 block">Abertura</label>
                  <input
                    type="time"
                    className="w-full bg-gray-50 border-2 border-transparent focus:border-[#141414] rounded-2xl p-5 outline-none font-bold text-xs transition-all cursor-pointer"
                    value={formData.working_hours.open}
                    onChange={e => setFormData({ ...formData, working_hours: { ...formData.working_hours, open: e.target.value } })}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#141414]/40 ml-4 mb-2 block">Fechamento</label>
                  <input
                    type="time"
                    className="w-full bg-gray-50 border-2 border-transparent focus:border-[#141414] rounded-2xl p-5 outline-none font-bold text-xs transition-all cursor-pointer"
                    value={formData.working_hours.close}
                    onChange={e => setFormData({ ...formData, working_hours: { ...formData.working_hours, close: e.target.value } })}
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            disabled={saving}
            className="w-full bg-[#141414] text-white font-black h-20 rounded-[32px] shadow-2xl flex items-center justify-center gap-4 hover:bg-[#F27D26] transition-all disabled:opacity-50 uppercase text-sm tracking-[0.2em]"
          >
            <Save size={24} /> {saving ? 'PROCESSANDO...' : 'SALVAR ALTERAÇÕES'}
          </button>
        </form>

        {/* ── Delivery Zones ──────────────────────────────────────────── */}
        {restaurant && (
          <section className="space-y-6">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-3xl font-black uppercase tracking-tight leading-none">
                  Bairros de <br /><span className="text-[#F27D26]">ENTREGA</span>
                </h2>
                <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.3em] mt-3">
                  Defina os bairros atendidos e o valor da taxa
                </p>
              </div>
              <Bike size={40} className="text-[#F27D26]/20" />
            </div>

            <div className="bg-white p-8 rounded-[48px] shadow-2xl border border-[#141414]/5 space-y-6">
              {/* Add zone form */}
              <form onSubmit={handleAddZone} className="flex gap-3">
                <div className="flex-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#141414]/40 ml-4 mb-2 block">Nome do Bairro</label>
                  <input
                    required
                    className="w-full bg-gray-50 border-2 border-transparent focus:border-[#141414] rounded-2xl p-4 outline-none font-bold text-xs uppercase tracking-widest transition-all"
                    placeholder="EX: CENTRO, JARDINS..."
                    value={newNeighborhood}
                    onChange={e => setNewNeighborhood(e.target.value)}
                  />
                </div>
                <div className="w-36">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#141414]/40 ml-4 mb-2 block">Taxa (R$)</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full bg-gray-50 border-2 border-transparent focus:border-[#141414] rounded-2xl p-4 outline-none font-bold text-xs tracking-widest transition-all"
                    placeholder="0.00"
                    value={newFee}
                    onChange={e => setNewFee(e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <button
                    disabled={addingZone}
                    className="h-[52px] w-[52px] bg-[#141414] text-white rounded-2xl flex items-center justify-center hover:bg-[#F27D26] transition-all shadow-lg disabled:opacity-50 flex-shrink-0"
                  >
                    <Plus size={22} />
                  </button>
                </div>
              </form>

              {/* Zones list */}
              {zones.length === 0 ? (
                <div className="py-10 border-2 border-dashed border-gray-100 rounded-[28px] flex flex-col items-center gap-3">
                  <MapPin size={28} className="text-gray-200" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">Nenhum bairro cadastrado</span>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  <AnimatePresence>
                    {zones.map(zone => (
                      <motion.div
                        key={zone.id}
                        layout
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex items-center justify-between py-4 group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-[#F27D26]/10 rounded-xl flex items-center justify-center">
                            <MapPin size={14} className="text-[#F27D26]" />
                          </div>
                          <span className="font-black text-xs uppercase tracking-widest text-[#141414]">{zone.neighborhood}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-black text-sm text-[#F27D26]">
                            {zone.fee === 0 ? 'Grátis' : formatCurrency(zone.fee)}
                          </span>
                          <button
                            onClick={() => handleDeleteZone(zone.id)}
                            className="p-2 rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Alert */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border-2 border-[#141414] p-8 rounded-[40px] flex gap-6 items-start shadow-[8px_8px_0px_#141414]"
        >
          <div className="w-12 h-12 bg-[#F27D26] rounded-2xl flex items-center justify-center text-white flex-shrink-0">
            <AlertCircle size={28} />
          </div>
          <div>
            <h4 className="font-black text-lg uppercase tracking-tight text-[#141414] mb-2">Atenção!</h4>
            <p className="text-xs font-bold text-gray-500 leading-relaxed uppercase tracking-widest">
              O número de WhatsApp deve conter apenas números (ex: 11999998888). Seus clientes serão redirecionados para este número ao finalizar o pedido.
            </p>
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
}
