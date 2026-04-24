'use client';

import { useState, useEffect } from 'react';

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  observations?: string;
  options: {
    groupName: string;
    optionName: string;
    price: number;
  }[];
};

export function useCart() {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        try {
          return JSON.parse(savedCart);
        } catch (e) {
          console.error('Failed to load cart', e);
        }
      }
    }
    return [];
  });

  useEffect(() => {
    // This effect is now only for logging or other syncs, 
    // but the linter complained about the previous version.
    // We don't strictly need it for loading anymore.
  }, []);

  const saveCart = (newItems: CartItem[]) => {
    setItems(newItems);
    localStorage.setItem('cart', JSON.stringify(newItems));
  };

  const addItem = (item: CartItem) => {
    const existingItemIndex = items.findIndex(
      (i) => i.id === item.id && JSON.stringify(i.options) === JSON.stringify(item.options)
    );

    if (existingItemIndex > -1) {
      const newItems = [...items];
      newItems[existingItemIndex].quantity += item.quantity;
      saveCart(newItems);
    } else {
      saveCart([...items, item]);
    }
  };

  const removeItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    saveCart(newItems);
  };

  const updateQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(index);
      return;
    }
    const newItems = [...items];
    newItems[index].quantity = quantity;
    saveCart(newItems);
  };

  const clearCart = () => {
    saveCart([]);
  };

  const total = items.reduce((acc, item) => {
    const optionsTotal = item.options.reduce((oAcc, o) => oAcc + o.price, 0);
    return acc + (item.price + optionsTotal) * item.quantity;
  }, 0);

  return { items, addItem, removeItem, updateQuantity, clearCart, total };
}
