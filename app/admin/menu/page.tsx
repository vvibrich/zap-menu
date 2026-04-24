'use client';

import AdminLayout from '@/components/admin/admin-layout';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import { Plus, Trash2, Edit2, GripVertical, Image as ImageIcon, Save, X, Utensils } from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import { motion, Reorder, AnimatePresence } from 'motion/react';
import Image from 'next/image';

type Category = { id: string; name: string; order_index: number };
type Product = { id: string; name: string; price: number; description: string; category_id: string; is_available: boolean; image_url: string };

export default function MenuManagement() {
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states
  const [newCatName, setNewCatName] = useState('');
  const [newProductData, setNewProductData] = useState({ name: '', price: '', description: '', category_id: '', image_url: '' });

  const fetchMenuData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: rest, error: restError } = await supabase.from('restaurants').select('*').eq('user_id', user.id).single();
      
      if (restError) {
        console.error('Error fetching restaurant:', restError);
      }
      
      setRestaurant(rest);

      if (rest) {
        const { data: cats, error: catsError } = await supabase.from('categories').select('*').eq('restaurant_id', rest.id).order('order_index');
        if (catsError) console.error('Error fetching categories:', catsError);
        setCategories(cats || []);
        
        const { data: prods, error: prodsError } = await supabase.from('products').select('*').eq('restaurant_id', rest.id);
        if (prodsError) console.error('Error fetching products:', prodsError);
        setProducts(prods || []);
      }
    } catch (err) {
      console.error('Unexpected error in fetchMenuData:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      const timeout = setTimeout(() => {
        fetchMenuData();
      }, 0);
      return () => clearTimeout(timeout);
    }
  }, [user]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant) {
      alert('Restaurante não encontrado. Tente recarregar a página.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingCategory) {
        const { error } = await supabase.from('categories').update({ name: newCatName }).eq('id', editingCategory.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('categories').insert({ 
          restaurant_id: restaurant.id, 
          name: newCatName, 
          order_index: categories.length 
        });
        if (error) throw error;
      }
      setNewCatName('');
      setIsCategoryModalOpen(false);
      setEditingCategory(null);
      await fetchMenuData();
    } catch (error: any) {
      console.error('Error saving category:', error);
      alert('Erro ao salvar categoria: ' + (error.message || 'Erro desconhecido'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant) {
      alert('Restaurante não encontrado.');
      return;
    }

    setIsSubmitting(true);
    const prodData = {
      ...newProductData,
      price: parseFloat(newProductData.price),
      restaurant_id: restaurant.id,
    };

    try {
      if (editingProduct) {
        const { error } = await supabase.from('products').update(prodData).eq('id', editingProduct.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('products').insert(prodData);
        if (error) throw error;
      }
      
      setNewProductData({ name: '', price: '', description: '', category_id: '', image_url: '' });
      setIsProductModalOpen(false);
      setEditingProduct(null);
      await fetchMenuData();
    } catch (error: any) {
      console.error('Error saving product:', error);
      alert('Erro ao salvar produto: ' + (error.message || 'Erro desconhecido'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteCategory = async (id: string) => {
    if (confirm('Tem certeza? Isso excluirá todos os produtos desta categoria.')) {
      await supabase.from('categories').delete().eq('id', id);
      fetchMenuData();
    }
  };

  const deleteProduct = async (id: string) => {
    if (confirm('Excluir este produto?')) {
      await supabase.from('products').delete().eq('id', id);
      fetchMenuData();
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto space-y-12 pb-24">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
             <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase leading-none">Gestão de <br/><span className="text-[#F27D26]">CARDÁPIO</span></h1>
             <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.3em] mt-4">Organize seus produtos e categorias</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setIsCategoryModalOpen(true)}
              className="px-6 py-4 bg-white border border-[#141414]/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2"
            >
              <Plus size={16} /> Categoria
            </button>
            <button 
              onClick={() => setIsProductModalOpen(true)}
              disabled={categories.length === 0}
              className="px-8 py-4 bg-[#141414] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#F27D26] transition-all shadow-xl flex items-center gap-2 disabled:opacity-50"
            >
              <Plus size={16} /> Novo Produto
            </button>
          </div>
        </header>

        {loading ? (
          <div className="py-20 flex flex-col items-center gap-4">
             <div className="w-12 h-12 border-4 border-[#F27D26]/20 border-t-[#F27D26] rounded-full animate-spin"></div>
             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Sincronizando Dados...</span>
          </div>
        ) : (
          <div className="grid gap-10">
            {categories.map((cat) => (
              <div key={cat.id} className="group">
                <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-[#141414] group-hover:border-[#F27D26] transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-8 bg-[#141414] group-hover:bg-[#F27D26] transition-colors"></div>
                    <h3 className="font-black text-2xl uppercase tracking-tighter text-[#141414]">
                      {cat.name}
                    </h3>
                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest ml-4">
                      {products.filter(p => p.category_id === cat.id).length} itens
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => { setEditingCategory(cat); setNewCatName(cat.name); setIsCategoryModalOpen(true); }}
                      className="p-3 bg-gray-100 rounded-xl text-gray-400 hover:text-[#141414] hover:bg-gray-200 transition-all"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => deleteCategory(cat.id)}
                      className="p-3 bg-gray-100 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {products.filter(p => p.category_id === cat.id).map(p => (
                    <motion.div 
                      layout
                      key={p.id} 
                      className="flex gap-4 p-5 bg-white rounded-[32px] border border-[#141414]/5 shadow-sm hover:shadow-xl transition-all group/item"
                    >
                      <div className="h-20 w-20 rounded-2xl bg-gray-50 flex-shrink-0 flex items-center justify-center text-gray-200 overflow-hidden relative border border-gray-100">
                         {p.image_url ? (
                           <Image src={p.image_url} alt={p.name} fill className="object-cover" referrerPolicy="no-referrer" />
                         ) : <ImageIcon size={32} />}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <p className="font-black text-sm uppercase tracking-tight text-[#141414] truncate mb-1">{p.name}</p>
                        <p className="text-[#F27D26] font-black text-xs">{formatCurrency(p.price)}</p>
                      </div>
                      <div className="flex flex-col gap-2 opacity-0 group-hover/item:opacity-100 transition-all">
                         <button 
                           onClick={() => { 
                             setEditingProduct(p); 
                             setNewProductData({ name: p.name, price: p.price.toString(), description: p.description, category_id: p.category_id, image_url: p.image_url }); 
                             setIsProductModalOpen(true); 
                           }}
                           className="p-2.5 bg-gray-50 rounded-xl text-gray-400 hover:text-[#141414] hover:shadow-md transition-all"
                         >
                            <Edit2 size={16} />
                         </button>
                         <button onClick={() => deleteProduct(p.id)} className="p-2.5 bg-gray-50 rounded-xl text-gray-400 hover:text-red-600 hover:shadow-md transition-all">
                            <Trash2 size={16} />
                         </button>
                      </div>
                    </motion.div>
                  ))}
                  {products.filter(p => p.category_id === cat.id).length === 0 && (
                    <div className="col-span-full py-12 border-2 border-dashed border-gray-100 rounded-[32px] flex flex-col items-center justify-center">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">Nenhum produto cadastrado</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Category Modal */}
        <AnimatePresence>
          {isCategoryModalOpen && (
            <div className="fixed inset-0 bg-[#141414]/90 z-[60] flex items-center justify-center p-6">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-[48px] p-10 w-full max-w-md shadow-2xl relative"
              >
                <button 
                  onClick={() => { setIsCategoryModalOpen(false); setEditingCategory(null); setNewCatName(''); }}
                  className="absolute top-6 right-6 p-3 bg-gray-100 rounded-2xl hover:bg-gray-200 transition"
                >
                  <X size={20} />
                </button>
                <div className="flex flex-col items-center text-center space-y-4 mb-10">
                  <div className="w-16 h-16 bg-[#141414] rounded-3xl flex items-center justify-center text-[#F27D26]">
                    <Plus size={32} />
                  </div>
                  <h2 className="text-3xl font-black uppercase tracking-tighter leading-none">
                    {editingCategory ? 'EDITAR' : 'NOVA'} <br/><span className="text-[#F27D26]">CATEGORIA</span>
                  </h2>
                </div>
                <form onSubmit={handleSaveCategory} className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#141414]/40 ml-4 mb-2 block">Nome da Categoria</label>
                    <input 
                      required 
                      autoFocus
                      className="w-full bg-gray-50 border-2 border-transparent focus:border-[#141414] rounded-2xl p-5 outline-none font-bold text-xs uppercase tracking-widest transition-all"
                      placeholder="EX: PIZZAS, BEBIDAS, SOBREMESAS"
                      value={newCatName}
                      onChange={e => setNewCatName(e.target.value)}
                    />
                  </div>
                  <button 
                    disabled={isSubmitting}
                    className="w-full bg-[#141414] text-white font-black h-16 rounded-[32px] flex items-center justify-center gap-3 hover:bg-[#F27D26] transition-all shadow-xl uppercase text-xs tracking-widest disabled:opacity-50"
                  >
                    <Save size={18} /> {isSubmitting ? 'SALVANDO...' : 'SALVAR CATEGORIA'}
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Product Modal */}
        <AnimatePresence>
          {isProductModalOpen && (
            <div className="fixed inset-0 bg-[#141414]/90 z-[60] flex items-center justify-center p-6">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-[48px] p-10 w-full max-w-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar"
              >
                <button 
                  onClick={() => { setIsProductModalOpen(false); setEditingProduct(null); }}
                  className="absolute top-6 right-6 p-3 bg-gray-100 rounded-2xl hover:bg-gray-200 transition"
                >
                  <X size={20} />
                </button>
                
                <div className="flex flex-col items-center text-center space-y-4 mb-10">
                  <div className="w-16 h-16 bg-[#F27D26] rounded-3xl flex items-center justify-center text-white">
                    <Utensils size={32} />
                  </div>
                  <h2 className="text-3xl font-black uppercase tracking-tighter leading-none">
                    {editingProduct ? 'EDITAR' : 'NOVO'} <br/><span className="text-[#141414]">PRODUTO</span>
                  </h2>
                </div>

                <form onSubmit={handleSaveProduct} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-[#141414]/40 ml-4 mb-2 block">Nome Completo</label>
                       <input 
                         required 
                         className="w-full bg-gray-50 border-2 border-transparent focus:border-[#141414] rounded-2xl p-5 outline-none font-bold text-xs uppercase tracking-widest transition-all"
                         placeholder="EX: PIZZA CALABRESA ESPECIAL"
                         value={newProductData.name} 
                         onChange={e => setNewProductData({...newProductData, name: e.target.value})} 
                       />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#141414]/40 ml-4 mb-2 block">Preço de Venda (R$)</label>
                      <input 
                        required 
                        type="number" 
                        step="0.01" 
                        className="w-full bg-gray-50 border-2 border-transparent focus:border-[#141414] rounded-2xl p-5 outline-none font-bold text-xs uppercase tracking-widest transition-all"
                        placeholder="0.00"
                        value={newProductData.price} 
                        onChange={e => setNewProductData({...newProductData, price: e.target.value})} 
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#141414]/40 ml-4 mb-2 block">Escolha a Categoria</label>
                      <select 
                        required 
                        className="w-full bg-gray-50 border-2 border-transparent focus:border-[#141414] rounded-2xl p-5 outline-none font-bold text-xs uppercase tracking-widest transition-all appearance-none cursor-pointer"
                        value={newProductData.category_id} 
                        onChange={e => setNewProductData({...newProductData, category_id: e.target.value})}
                      >
                        <option value="">SELECIONE...</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#141414]/40 ml-4 mb-2 block">Descrição Breve</label>
                      <textarea 
                        rows={3} 
                        className="w-full bg-gray-50 border-2 border-transparent focus:border-[#141414] rounded-2xl p-5 outline-none font-bold text-xs uppercase tracking-widest transition-all resize-none"
                        placeholder="EX: MOLHO, MUÇARELA, CALABRESA E CEBOLA."
                        value={newProductData.description} 
                        onChange={e => setNewProductData({...newProductData, description: e.target.value})} 
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#141414]/40 ml-4 mb-2 block">Link da Imagem</label>
                      <input 
                        className="w-full bg-gray-50 border-2 border-transparent focus:border-[#141414] rounded-2xl p-5 outline-none font-bold text-xs uppercase tracking-widest transition-all"
                        placeholder="HTTPS://MEUHOS-PEDAGEM.COM/FOTO.JPG"
                        value={newProductData.image_url} 
                        onChange={e => setNewProductData({...newProductData, image_url: e.target.value})} 
                      />
                    </div>
                  </div>
                  <button 
                    disabled={isSubmitting}
                    className="w-full bg-[#141414] text-white font-black h-16 rounded-[32px] flex items-center justify-center gap-3 hover:bg-[#F27D26] transition-all shadow-xl uppercase text-xs tracking-widest mt-4 disabled:opacity-50"
                  >
                    <Save size={18} /> {isSubmitting ? 'SALVANDO...' : 'FINALIZAR PRODUTO'}
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #F27D26; border-radius: 10px; }
      `}</style>
    </AdminLayout>
  );
}
