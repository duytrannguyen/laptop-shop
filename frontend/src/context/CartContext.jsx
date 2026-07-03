import React, { createContext, useContext, useState, useCallback } from 'react';
import { getEffectivePrice } from '../utils/priceUtils';

/**
 * CartContext – Quản lý giỏ hàng của khách hàng.
 *
 * Giỏ hàng được lưu vào localStorage (key: 'techshop_cart') để giữ lại sau khi đóng tab.
 *
 * Cung cấp:
 * - cart: mảng các sản phẩm trong giỏ, mỗi item có thêm trường qty
 * - add(product): thêm 1 sản phẩm vào giỏ (nếu đã có thì tăng qty, kiểm tra tồn kho)
 * - remove(id): xóa sản phẩm khỏi giỏ theo id
 * - updateQty(id, qty): cập nhật số lượng (không vượt quá stock)
 * - clear(): xóa toàn bộ giỏ hàng
 * - total: tổng tiền (dùng giá khuyến mãi nếu đang sale)
 * - count: tổng số lượng sản phẩm trong giỏ (hiển thị badge trên icon giỏ)
 */
const CartContext = createContext();

export function CartProvider({ children }) {
  // Khởi tạo giỏ hàng từ localStorage khi ứng dụng load
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('techshop_cart') || '[]');
    } catch {
      return [];
    }
  });

  /** Helper: cập nhật state và đồng bộ vào localStorage cùng lúc. */
  const save = useCallback((items) => {
    setCart(items);
    localStorage.setItem('techshop_cart', JSON.stringify(items));
  }, []);

  /**
   * Thêm sản phẩm vào giỏ.
   * - Nếu hết hàng (stock < 1) → không thêm
   * - Nếu đã có trong giỏ → tăng qty (không vượt quá stock)
   * - Nếu chưa có → thêm mới với qty = 1
   */
  const add = useCallback((product) => {
    setCart((prev) => {
      if ((product.stock ?? 0) < 1) return prev; // Hết hàng, không thêm
      const existing = prev.find((i) => i.id === product.id);
      const items = existing
        ? prev.map((item) => item.id === product.id
          ? { ...item, ...product, qty: Math.min(item.qty + 1, product.stock) }
          : item)
        : [...prev, { ...product, qty: 1 }];
      localStorage.setItem('techshop_cart', JSON.stringify(items));
      return items;
    });
  }, []);

  /** Xóa một sản phẩm khỏi giỏ theo id. */
  const remove = useCallback((id) => {
    setCart((prev) => {
      const items = prev.filter((i) => i.id !== id);
      localStorage.setItem('techshop_cart', JSON.stringify(items));
      return items;
    });
  }, []);

  /** Cập nhật số lượng sản phẩm, không cho dưới 1 và không vượt quá stock. */
  const updateQty = useCallback((id, qty) => {
    if (qty < 1) return;
    setCart((prev) => {
      const items = prev.map((i) => (i.id === id ? { ...i, qty: Math.min(qty, i.stock ?? qty) } : i));
      localStorage.setItem('techshop_cart', JSON.stringify(items));
      return items;
    });
  }, []);

  /** Xóa toàn bộ giỏ hàng và localStorage. */
  const clear = useCallback(() => {
    setCart([]);
    localStorage.removeItem('techshop_cart');
  }, []);

  // Tổng tiền: dùng giá khuyến mãi (nếu đang sale) từ priceUtils
  const total = cart.reduce((sum, item) => {
    const price = getEffectivePrice(item);
    return sum + price * item.qty;
  }, 0);

  // Tổng số lượng sản phẩm (hiển thị badge trên icon giỏ hàng)
  const count = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <CartContext.Provider value={{ cart, add, remove, updateQty, clear, total, count }}>
      {children}
    </CartContext.Provider>
  );
}

/** Hook để sử dụng CartContext trong các component con. */
export const useCart = () => useContext(CartContext);
