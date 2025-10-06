import React from 'react';
import { useCategories } from '../hooks/useProducts.js';

const CategoryFilter = ({ selectedCategory, onCategoryChange }) => {
  const { categories } = useCategories();
  return (
    <div className="sm:flex sm:flex-wrap grid grid-cols-2 gap-4 justify-center mb-10">
      <button
        onClick={() => onCategoryChange('all')}
        className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500
          ${selectedCategory === 'all'
            ? 'bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 text-white shadow-xl'
            : 'bg-white/80 text-gray-700 hover:bg-green-50 shadow-md border border-green-100'
          }`}
        aria-pressed={selectedCategory === 'all'}
      >
        All Products
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.slug)}
          className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500
            ${selectedCategory === category.slug
              ? 'bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 text-white shadow-xl'
              : 'bg-white/80 text-gray-700 hover:bg-green-50 shadow-md border border-green-100'
            }`}
          aria-pressed={selectedCategory === category.slug}
        >
          {category.icon && (
            <span className="sm:text-xl text-sm">{category.icon}</span>
          )}
          <span className='sm:text-sm text-xs'>{category.name}</span>
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;