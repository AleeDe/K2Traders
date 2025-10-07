import React, { lazy, Suspense, useEffect, useMemo, useState, startTransition } from "react";
import { Search, Grid, List } from "lucide-react";

// Lazy load components
const ProductCard = lazy(() => import("../components/ProductCard.jsx"));
const CategoryFilter = lazy(() => import("../components/CategoryFilter.jsx"));
import { useProducts } from "../hooks/useProducts.js";

// Simple Skeleton box
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

const Loader = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
  </div>
);

const ShopPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const { products, loading } = useProducts();
  
  // Fixed slider bounds
  const MAX_PRICE = 100000;

  // Clamp current range if out of bounds
  useEffect(() => {
    setPriceRange(([min, max]) => [
      Math.max(0, Math.min(min, MAX_PRICE)),
      Math.max(0, Math.min(max, MAX_PRICE))
    ]);
  }, []);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Filtered Products (memoized)
  const filteredProducts = useMemo(() => {
    return (products || []).filter((product) => {
      const matchesCategory =
        selectedCategory === "all" || product.category === selectedCategory;
      const matchesSearch =
        (product.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPrice =
        Number(product.price || 0) >= priceRange[0] && Number(product.price || 0) <= priceRange[1];
      return matchesCategory && matchesSearch && matchesPrice;
    });
  }, [products, selectedCategory, searchTerm, priceRange]);

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "rating":
        return b.rating - a.rating;
      case "name":
        return a.name.localeCompare(b.name);
      case "newest":
        return b.id - a.id;
      default:
        return b.featured - a.featured;
    }
  });

  if (loading) {
    return (
      <section className="min-h-screen bg-gray-50 pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Heading skeleton */}
          <div className="text-center mb-12">
            <Skeleton className="h-10 w-2/3 mx-auto mb-4" />
            <Skeleton className="h-5 w-1/2 mx-auto" />
          </div>

          {/* Filters skeleton */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-6 items-center">
              <Skeleton className="h-12 w-full max-w-md" />
              <Skeleton className="h-12 w-48" />
              <div className="flex gap-2">
                <Skeleton className="h-10 w-10" />
                <Skeleton className="h-10 w-10" />
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <Skeleton className="h-5 w-40 mb-3" />
              <Skeleton className="h-2 w-full rounded" />
            </div>
          </div>

          {/* Category Filter skeleton */}
          <div className="flex gap-4 mb-8 overflow-x-auto">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-10 w-24" />
            ))}
          </div>

          {/* Products skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border shadow p-4 flex flex-col"
              >
                <Skeleton className="h-40 w-full mb-4 rounded-lg" />
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-6 w-20 mt-auto" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
      <div className="min-h-screen bg-gray-50 pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Our Product Collection
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Discover authentic organic products from the pristine valleys of
              Gilgit-Baltistan
            </p>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-6 items-center">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => startTransition(() => setSortBy(e.target.value))}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white min-w-[200px]"
              >
                <option value="featured">Featured</option>
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="name">Name: A to Z</option>
              </select>

              {/* View Mode */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => startTransition(() => setViewMode("grid"))}
                  className={`p-2 rounded-md transition-colors duration-200 ${
                    viewMode === "grid"
                      ? "bg-white shadow-sm text-green-600"
                      : "text-gray-600"
                  }`}
                >
                  <Grid className="h-5 w-5" />
                </button>
                <button
                  onClick={() => startTransition(() => setViewMode("list"))}
                  className={`p-2 rounded-md transition-colors duration-200 ${
                    viewMode === "list"
                      ? "bg-white shadow-sm text-green-600"
                      : "text-gray-600"
                  }`}
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Price Range */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Price Range: Rs {priceRange[0]} - Rs {priceRange[1]}
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1"><span>Min</span><span>Rs {priceRange[0]}</span></div>
                  <input
                    aria-label="Minimum price"
                    type="range"
                    min={0}
                    max={MAX_PRICE}
                    value={priceRange[0]}
                    onChange={(e) => {
                      const nextMin = Math.min(Number(e.target.value), priceRange[1]);
                      setPriceRange([nextMin, priceRange[1]]);
                    }}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1"><span>Max</span><span>Rs {priceRange[1]}</span></div>
                  <input
                    aria-label="Maximum price"
                    type="range"
                    min={0}
                    max={MAX_PRICE}
                    value={priceRange[1]}
                    onChange={(e) => {
                      const nextMax = Math.max(Number(e.target.value), priceRange[0]);
                      setPriceRange([priceRange[0], nextMax]);
                    }}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <Suspense fallback={<div className="mb-8 h-10 bg-gray-100 rounded-xl" aria-hidden />}> 
            <CategoryFilter
              selectedCategory={selectedCategory}
              onCategoryChange={(value) => startTransition(() => setSelectedCategory(value))}
            />
          </Suspense>

          {/* Results Count */}
          <div className="flex justify-between items-center mb-8">
            <p className="text-gray-600">
              Showing {sortedProducts.length} of {(products || []).length} products
            </p>
          </div>

          {/* Products Grid/List */}
          <Suspense fallback={
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl border shadow p-4 h-64 animate-pulse" />
              ))}
            </div>
          }>
            {sortedProducts ? (
              <div
                className={`${
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                    : "space-y-6"
                }`}
              >
                {sortedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            ) : (
              <div>Loading products...</div>
            )}
          </Suspense>

          {sortedProducts.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                No products found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </div>
      </div>
  );
};

export default ShopPage;
