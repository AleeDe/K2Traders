import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpDown, Search } from 'lucide-react';
import CategoryFilter from './CategoryFilter.jsx';
import ProductCard from './ProductCard.jsx';
import { useProducts } from '../hooks/useProducts.js';

const formatPrice = (v) => {
  if (v == null) return '';
  const n = Number(v);
  return isNaN(n) ? v : `$${n.toFixed(2)}`;
};

const Shop = () => {
  const { products, loading } = useProducts();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return products.filter((p) => {
      const inCategory = selectedCategory === 'all' || p.category === selectedCategory;
      const matchesQuery =
        !q ||
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.title && p.title.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q));
      return inCategory && matchesQuery;
    });
  }, [products, selectedCategory, searchTerm]);

  const sortedProducts = useMemo(() => {
    const arr = [...filtered];
    switch (sortBy) {
      case 'price-low':
        arr.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
        break;
      case 'price-high':
        arr.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
        break;
      case 'rating':
        arr.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
      case 'name':
        arr.sort((a, b) => (a.name || a.title || '').localeCompare(b.name || b.title || ''));
        break;
      default:
        arr.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }
    return arr;
  }, [filtered, sortBy]);

  if (loading) {
    return (
      <section className="relative py-24 bg-gradient-to-b from-white via-green-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading products...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="shop" className="relative py-24 bg-gradient-to-b from-white via-green-50 to-white">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
            Collections
          </span>
          <h2 className="mt-3 text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
            Our Product Collection
          </h2>
          <p className="mt-3 text-gray-600 max-w-2xl mx-auto text-lg">
            Explore authentic organic products from the heart of Baltistan.
          </p>
        </div>

        {/* Controls (sticky) */}
        <div className="sticky top-16 z-20 mb-6 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 backdrop-blur bg-white/70 border-b border-gray-100 rounded-b-2xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <CategoryFilter selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} />
            </div>

            <div className="flex items-center gap-3">
              <div className="relative hidden sm:flex items-center">
                <Search className="h-4 w-4 text-gray-400 absolute left-3 pointer-events-none" />
                <input
                  aria-label="Search products"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-600 hidden sm:block">
                  Showing <span className="font-semibold text-gray-900">{sortedProducts.length}</span>
                </p>

                <label className="relative inline-flex items-center">
                  <ArrowUpDown className="h-4 w-4 text-gray-500 absolute left-3 pointer-events-none" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="pl-8 pr-10 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    aria-label="Sort products"
                  >
                    <option value="featured">Featured</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                    <option value="name">Name: A to Z</option>
                  </select>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
          {sortedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {sortedProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No products found.</p>
            <Link to="/shop" className="inline-flex items-center mt-4 gap-2 text-green-600 font-semibold">
              Reset filters
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default Shop;