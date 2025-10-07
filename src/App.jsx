import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Header from './components/commoncomponents/Header.jsx';
import Footer from './components/commoncomponents/Footer.jsx';
import Home from './pages/Home.jsx';
import ShopPage from './pages/ShopPage.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import AboutPage from './pages/AboutPage.jsx';
import BrandStoryPage from './pages/BrandStoryPage.jsx';
import BlogPage from './pages/BlogPage.jsx';
import BlogDetailPage from './pages/BlogDetailPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import Success from './pages/Success.jsx';
import TrackOrder from './pages/TrackOrder.jsx';
import AdminLogin from './pages/AdminLogin.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import AdminSignup from './pages/AdminSignup.jsx';
import AdminForgotPassword from './pages/AdminForgotPassword.jsx';
import AdminResetPassword from './pages/AdminResetPassword.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { WishlistProvider } from './context/WishContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import RedirectOnOrderId from './components/commoncomponents/RedirectOnOrderId.jsx';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <Router>
            <RedirectOnOrderId />
            <Routes>
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/signup" element={<AdminSignup />} />
              <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />
              <Route path="/admin/reset-password" element={<AdminResetPassword />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="*" element={
                <div className="min-h-screen max-w-[100vw]">
                  <Header />
                  <main>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/shop" element={<ShopPage />} />
                      <Route path="/shop/:id" element={<ProductDetail />} />
                      <Route path="/about" element={<AboutPage />} />
                      <Route path="/brand-story" element={<BrandStoryPage />} />
                      <Route path="/blog" element={<BlogPage />} />
                      <Route path="/blog/:id" element={<BlogDetailPage />} />
                      <Route path="/contact" element={<ContactPage />} />
                      <Route path="/track-order" element={<TrackOrder />} />
                      <Route path="/success" element={<Success />} />
                    </Routes>
                  </main>
                  <Footer />
                </div>
              } />
            </Routes>
          </Router>
        </WishlistProvider>
        <Toaster position="top-right" />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;