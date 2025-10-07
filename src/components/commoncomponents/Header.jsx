import React, { useEffect, useState, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  Mountain,
  Menu,
  X,
  ShoppingCart,
  User,
  Search,
  Heart,
  LogOut
} from 'lucide-react';
import { useCart } from '../../context/CartContext.jsx';
import CartDrawer from '../CartDrawer.jsx';

const Header = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { count } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef(null);

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Shop', href: '/shop' },
    { name: 'About Us', href: '/about' },
    { name: 'Brand Story', href: '/brand-story' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contact', href: '/contact' },
    { name: 'Track Order', href: '/track-order' }
  ];

  const isActive = (href) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  useEffect(() => {
    setMobileOpen(false);
    setIsMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (showSearch) {
      searchRef.current?.focus();
    }
  }, [showSearch]);

  // close menus with Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
        setCartOpen(false);
        setShowSearch(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-white backdrop-blur border-b border-gray-100">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-3">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-3">
          <div className="sm:w-10 w-8 sm:h-10 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-lg transform-gpu transition-transform hover:scale-105">
            <Mountain className="sm:h-6 sm:w-6 w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="sm:text-xl font-bold text-green-800 leading-tight">K2 Traders</h1>
            <p className="text-xs text-green-600 -mt-1">Nature from Baltistan</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-8" aria-label="Primary">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive: navIsActive }) =>
                `font-medium transition-colors duration-200 relative group ${
                  isActive(item.href) || navIsActive ? 'text-green-600' : 'text-gray-700 hover:text-green-600'
                }`
              }
            >
              {item.name}
              <span className={`absolute bottom-0 left-0 h-0.5 bg-green-600 transition-all duration-300 ${
                isActive(item.href) ? 'w-full' : 'w-0 group-hover:w-full'
              }`} />
            </NavLink>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* <button
            onClick={() => setShowSearch((s) => !s)}
            aria-expanded={showSearch}
            aria-label="Open search"
            className="hidden md:flex p-2 text-gray-600 hover:text-green-600 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 rounded"
            title="Search"
          >
            <Search className="h-5 w-5" />
          </button> */}

          {/* Search input (animated) */}
          <div className={`relative transition-all ${showSearch ? 'w-64' : 'w-0 overflow-hidden'}`}>
            <input
              ref={searchRef}
              type="search"
              placeholder="Search products..."
              className="w-full rounded-full border border-gray-200 px-4 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 bg-white/90 text-sm"
              style={{ boxShadow: '0 6px 20px rgba(16,185,129,0.08)' }}
              aria-label="Search products"
            />
          </div>

          {/* <button
            className="p-2 text-gray-600 hover:text-green-600 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 rounded"
            title="Account"
            aria-label="Account"
          >
            <User className="h-5 w-5" />
          </button> */}

          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="relative inline-flex items-center justify-center rounded-full border border-gray-200 bg-white p-2 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
            title="Open cart"
            aria-label="Open cart"
          >
            <ShoppingCart className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-green-600 px-1.5 text-xs font-bold text-white shadow">
                {count}
              </span>
            )}
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen((s) => !s)}
            className="lg:hidden p-2 text-gray-600 hover:text-green-600 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 rounded"
            aria-label="Open main menu"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden">
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setIsMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed right-0 top-0 z-50 w-full max-w-xs bg-white/95 backdrop-blur-sm border-l border-gray-100 h-full shadow-2xl transform-gpu">
            <div className="p-4 bg-white">
              <div className="flex items-center justify-between bg-white">
                <Link to="/" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow">
                    <Mountain className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-bold text-green-800">K2 Traders</span>
                </Link>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500">
                  <X className="h-6 w-6 text-gray-700" />
                </button>
              </div>

              <nav className="mt-6 flex flex-col gap-3 bg-white" aria-label="Mobile">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`py-2 px-3 rounded-md font-medium ${isActive(item.href) ? 'bg-green-50 text-green-700' : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    {item.name}
                  </Link>
                ))}

                <div className="mt-4 pt-4 border-t border-gray-100">

                  {/* <Link to="/wishlist" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 py-2 px-3 rounded-md text-gray-700 hover:bg-gray-50">
                    <Heart className="h-5 w-5" /> Wishlist
                  </Link> */}
                </div>
              </nav>
            </div>
          </div>
        </div>
      )}

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </header>
  );
};

export default Header;