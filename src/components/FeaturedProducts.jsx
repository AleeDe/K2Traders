import React, { useState } from 'react';
import ProductCard from './ProductCard.jsx';
import { useProducts } from '../hooks/useProducts.js';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const FeaturedProducts = () => {
  const { products, loading } = useProducts();
  const featuredProducts = products.filter((p) => p?.featured);
  const [loadedCount, setLoadedCount] = useState(0);

  const handleImageLoad = () => {
    setLoadedCount((prev) => prev + 1);
  };

  const allLoaded = loadedCount >= featuredProducts.length;

  if (loading || !featuredProducts.length) {
    return (
      <section className="py-20 bg-gradient-to-b from-white via-green-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            {loading && (
              <>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading products...</p>
              </>
            )}
          </div>
        </div>
      </section>
    );
  }
  
  return (
    <section
      aria-labelledby="featured-heading"
      className="py-20 bg-gradient-to-b from-white via-green-50 to-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-14 gap-6">
          <div>
            <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
              Handpicked
            </span>
            <h2
              id="featured-heading"
              className="mt-3 text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900"
            >
              Featured Products
            </h2>
            <p className="mt-3 text-gray-600 max-w-2xl">
              Discover customer favorites sourced from the pristine valleys of Gilgit-Baltistan.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 rounded-xl bg-white/90 px-4 py-2 font-semibold text-green-700 shadow hover:shadow-md hover:-translate-y-0.5 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
              aria-label="View full shop"
            >
              View All
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Products Grid */}
        <div className="relative">
          {/* Loader Overlay */}
          {!allLoaded && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8 transition-opacity duration-500">
              {Array.from({ length: Math.max(1, featuredProducts.length || 8) }).map((_, i) => (
                <div key={i} className='bg-gray-200 animate-pulse h-[300px] w-full' />
              ))}
            </div>
          )}

          {/* Always render products (so onLoad fires) */}
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8 transition-opacity duration-500 ${
              allLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onImageLoad={handleImageLoad} // ✅ callback
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
