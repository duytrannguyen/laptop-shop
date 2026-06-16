import React, { createContext, useContext, useState, useCallback } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('laptopshop_cart') || '[]');
    } catch {
      return [];
    }
  });

  const save = useCallback((items) => {
    setCart(items);
    localStorage.setItem('laptopshop_cart', JSON.stringify(items));
  }, []);

  const add = useCallback((product) => {
    setCart((prev) => {
      if ((product.stock ?? 0) < 1) return prev;
      const existing = prev.find((i) => i.id === product.id);
      const items = existing
        ? prev.map((item) => item.id === product.id
          ? { ...item, ...product, qty: Math.min(item.qty + 1, product.stock) }
          : item)
        : [...prev, { ...product, qty: 1 }];
      localStorage.setItem('laptopshop_cart', JSON.stringify(items));
      return items;
    });
  }, []);

  const remove = useCallback((id) => {
    setCart((prev) => {
      const items = prev.filter((i) => i.id !== id);
      localStorage.setItem('laptopshop_cart', JSON.stringify(items));
      return items;
    });
  }, []);

  const updateQty = useCallback((id, qty) => {
    if (qty < 1) return;
    setCart((prev) => {
      const items = prev.map((i) => (i.id === id ? { ...i, qty: Math.min(qty, i.stock ?? qty) } : i));
      localStorage.setItem('laptopshop_cart', JSON.stringify(items));
      return items;
    });
  }, []);

  const clear = useCallback(() => {
    setCart([]);
    localStorage.removeItem('laptopshop_cart');
  }, []);

  const total = cart.reduce((sum, item) => {
    const price = item.salePrice || item.price;
    return sum + price * item.qty;
  }, 0);

  const count = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <CartContext.Provider value={{ cart, add, remove, updateQty, clear, total, count }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
