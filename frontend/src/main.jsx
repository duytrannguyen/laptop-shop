import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { SiteProvider } from './context/SiteContext';
import { ToastProvider } from './components/ToastContext';
import ScrollToTop from './components/ScrollToTop';
import BackToTop from './components/BackToTop';

// User pages
import UserLayout from './user/UserLayout';
import HomePage from './user/HomePage';
import ProductsPage from './user/ProductsPage';
import ProductDetailPage from './user/ProductDetailPage';
import CartPage from './user/CartPage';
import CheckoutPage from './user/CheckoutPage';
import NewsPage from './user/NewsPage';
import PostDetailPage from './user/PostDetailPage';
import ContactPage from './user/ContactPage';
import AboutPage from './user/AboutPage';
import WarrantyPage from './user/WarrantyPage';
import InstallmentPage from './user/InstallmentPage';
import FAQPage from './user/FAQPage';
import OrderTrackingPage from './user/OrderTrackingPage';

// Admin pages
import AdminLogin from './admin/AdminLogin';
import AdminLayout from './admin/AdminLayout';
import DashboardPage from './admin/DashboardPage';
import ProductsManage from './admin/ProductsManage';
import CategoriesManage from './admin/CategoriesManage';
import BrandsManage from './admin/BrandsManage';
import ProductGroupsManage from './admin/ProductGroupsManage';
import NeedsManage from './admin/NeedsManage';
import PostsManage from './admin/PostsManage';
import OrdersManage from './admin/OrdersManage';
import SettingsPage from './admin/SettingsPage';
import BannersManage from './admin/BannersManage';
import MediaManage from './admin/MediaManage';
import ContactsManage from './admin/ContactsManage';

import './styles/app.css';
import './styles/toast.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SiteProvider>
          <CartProvider>
            <ToastProvider>
              <ScrollToTop />
              <Routes>
                {/* ========== USER ROUTES ========== */}
                <Route element={<UserLayout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/products" element={<ProductsPage />} />
                  <Route path="/product/:slug" element={<ProductDetailPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/news" element={<NewsPage />} />
                  <Route path="/news/:slug" element={<PostDetailPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/warranty" element={<WarrantyPage />} />
                  <Route path="/installment" element={<InstallmentPage />} />
                  <Route path="/faq" element={<FAQPage />} />
                  <Route path="/order-tracking" element={<OrderTrackingPage />} />
                </Route>

                {/* ========== ADMIN ROUTES ========== */}
                <Route path="/admin/login" element={<AdminLogin />} />
                {/* Standalone file browser for CKEditor */}
                <Route path="/admin/file-browser" element={
                  <div style={{ padding: '20px', background: '#f4f6f8', minHeight: '100vh' }}>
                    <MediaManage />
                  </div>
                } />
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<DashboardPage />} />
                  <Route path="products" element={<ProductsManage />} />
                  <Route path="categories" element={<CategoriesManage />} />
                  <Route path="brands" element={<BrandsManage />} />
                  <Route path="product-groups" element={<ProductGroupsManage />} />
                  <Route path="needs" element={<NeedsManage />} />
                  <Route path="posts" element={<PostsManage />} />
                  <Route path="orders" element={<OrdersManage />} />
                  <Route path="banners" element={<BannersManage />} />
                  <Route path="media" element={<MediaManage />} />
                  <Route path="contacts" element={<ContactsManage />} />
                  <Route path="settings" element={<SettingsPage />} />
                </Route>

                {/* ========== FALLBACK ========== */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              <BackToTop />
            </ToastProvider>
          </CartProvider>
        </SiteProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);
