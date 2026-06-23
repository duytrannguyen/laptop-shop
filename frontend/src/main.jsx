import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { SiteProvider } from './context/SiteContext';
import { ToastProvider } from './context/ToastContext';
import ScrollToTop from './components/common/ScrollToTop';
import BackToTop from './components/common/BackToTop';

// User pages
import UserLayout from './components/layout/UserLayout';
import HomePage from './pages/user/HomePage';
import ProductsPage from './pages/user/ProductsPage';
import ProductDetailPage from './pages/user/ProductDetailPage';
import CartPage from './pages/user/CartPage';
import CheckoutPage from './pages/user/CheckoutPage';
import NewsPage from './pages/user/NewsPage';
import PostDetailPage from './pages/user/PostDetailPage';
import ContactPage from './pages/user/ContactPage';
import AboutPage from './pages/user/AboutPage';
import WarrantyPage from './pages/user/WarrantyPage';
import InstallmentPage from './pages/user/InstallmentPage';
import FAQPage from './pages/user/FAQPage';
import OrderTrackingPage from './pages/user/OrderTrackingPage';
import NotFoundPage from './pages/user/NotFoundPage';

// Admin pages
import AdminLogin from './pages/auth/AdminLogin';
import AdminLayout from './components/layout/AdminLayout';
import DashboardPage from './pages/admin/DashboardPage';
import ProductsManage from './pages/admin/ProductsManage';
import CategoriesManage from './pages/admin/CategoriesManage';
import BrandsManage from './pages/admin/BrandsManage';
import ProductGroupsManage from './pages/admin/ProductGroupsManage';
import NeedsManage from './pages/admin/NeedsManage';
import PostsManage from './pages/admin/PostsManage';
import OrdersManage from './pages/admin/OrdersManage';
import SettingsPage from './pages/admin/SettingsPage';
import BannersManage from './pages/admin/BannersManage';
import MediaManage from './pages/admin/MediaManage';
import ContactsManage from './pages/admin/ContactsManage';
import MenuManage from './pages/admin/MenuManage';
import FooterManage from './pages/admin/FooterManage';

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
                  <Route path="/not-found" element={<NotFoundPage />} />
                  <Route path="*" element={<NotFoundPage />} />
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
                  <Route path="menu" element={<MenuManage />} />
                  <Route path="footer" element={<FooterManage />} />
                  <Route path="settings" element={<SettingsPage />} />
                </Route>

                {/* ========== FALLBACK ========== */}
                {/* Fallback is handled by the * route inside UserLayout */}
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
