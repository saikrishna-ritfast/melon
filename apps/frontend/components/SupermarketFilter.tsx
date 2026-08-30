'use client';

import React, { useState, useTransition } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useCartStore } from '../store/useCartStore';
import styles from './ProductCard.module.css';

interface Category {
  id: string;
  name: string;
  slug: string;
  children?: Category[];
}

interface Product {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  status: string;
  specs: any;
  category: { id: string; name: string; slug: string };
  variants: Array<{
    id: string;
    name: string;
    sku: string;
    price: string;
    inventory?: { stock: number };
  }>;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export default function SupermarketFilter() {
  const [isPending, startTransition] = useTransition();
  const [activeCategory, setActiveCategory] = useState<string>(''); // Selected slug
  const [search, setSearch] = useState<string>('');
  const [searchInput, setSearchInput] = useState<string>(''); // Separate for text input

  const addItem = useCartStore((state) => state.addItem);

  // Fetch Categories
  const { data: categoriesData } = useQuery<{ status: string; data: Category[] }>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/products/categories`);
      if (!res.ok) throw new Error('Failed to fetch categories');
      return res.json();
    },
  });

  // Fetch Products based on selected filters
  const { data: productsData, isLoading: isProductsLoading } = useQuery<{
    status: string;
    data: { products: Product[] };
  }>({
    queryKey: ['products', activeCategory, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (activeCategory) params.append('category', activeCategory);
      if (search) params.append('search', search);
      params.append('limit', '20');

      const res = await fetch(`${API_URL}/products?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch products');
      return res.json();
    },
  });

  const categories = categoriesData?.data || [];
  const products = productsData?.data?.products || [];

  // TanStack Query Mutation for Add to Cart
  const addToCartMutation = useMutation({
    mutationFn: async ({ productId, variantId }: { productId: string; variantId: string }) => {
      // Fetch token from localStorage if authenticated
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') || undefined : undefined;
      await addItem(productId, variantId, 1, token);
    },
    onSuccess: () => {
      console.log('Item added to cart successfully');
    },
  });

  const handleCategorySelect = (slug: string) => {
    // Non-blocking state update via startTransition
    startTransition(() => {
      setActiveCategory(slug);
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);

    // De-prioritize the actual data query trigger so user input typing remains instant and frame-drop free
    startTransition(() => {
      setSearch(value);
    });
  };

  const quickAdd = (productId: string, variantId: string) => {
    addToCartMutation.mutate({ productId, variantId });
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 text-white min-h-screen">
      {/* Search and Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
            Marketplace Catalog
          </h1>
          <p className="text-gray-400 mt-1">Premium beverages, tech books, and more</p>
        </div>
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search catalog instantly..."
            value={searchInput}
            onChange={handleSearchChange}
            className="w-full bg-slate-900 border border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white placeholder-gray-500 transition-all duration-300"
          />
        </div>
      </div>

      {/* Category Pills Navigation */}
      <div className="flex flex-wrap gap-3 mb-8 pb-4 border-b border-gray-850">
        <button
          onClick={() => handleCategorySelect('')}
          className={`px-5 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 ${
            activeCategory === ''
              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20'
              : 'bg-slate-900 border border-gray-850 hover:bg-slate-800 text-gray-300 hover:text-white'
          }`}
        >
          All Categories
        </button>
        {categories.map((cat) => {
          const isActive = activeCategory === cat.slug;
          let themeClasses = 'bg-slate-900 border border-gray-850 text-gray-300 hover:bg-slate-800 hover:text-white';

          if (isActive) {
            if (cat.slug === 'beverages') {
              themeClasses = 'bg-emerald-600 text-white border-transparent shadow-lg shadow-emerald-500/20';
            } else if (cat.slug === 'books') {
              themeClasses = 'bg-blue-600 text-white border-transparent shadow-lg shadow-blue-500/20';
            } else {
              themeClasses = 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-transparent';
            }
          }

          return (
            <div key={cat.id} className="flex gap-2">
              <button
                onClick={() => handleCategorySelect(cat.slug)}
                className={`px-5 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 ${themeClasses}`}
              >
                {cat.name}
              </button>

              {/* Render child categories when parent is active */}
              {cat.slug === activeCategory && cat.children && cat.children.map((child) => (
                <button
                  key={child.id}
                  onClick={() => handleCategorySelect(child.slug)}
                  className="px-4 py-2 rounded-full font-medium text-xs transition-all duration-300 bg-slate-800 hover:bg-slate-700 text-gray-300"
                >
                  {child.name}
                </button>
              ))}
            </div>
          );
        })}
      </div>

      {/* Transition Spinner State */}
      <div className="relative">
        {isPending && (
          <div className={styles.spinnerContainer}>
            <div className={styles.spinner}></div>
            <p className="text-indigo-400 text-sm font-semibold animate-pulse mt-2">Switching category...</p>
          </div>
        )}

        {/* Product Grid */}
        {isProductsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-80 bg-slate-900/50 rounded-2xl border border-gray-800"></div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/20 border border-gray-800 rounded-2xl">
            <p className="text-gray-400">No products found matching your selection.</p>
          </div>
        ) : (
          <div
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 transition-opacity duration-300 ${
              isPending ? styles.pendingState : ''
            }`}
          >
            {products.map((product) => {
              const defaultVariant = product.variants[0];
              const price = defaultVariant ? parseFloat(defaultVariant.price).toFixed(2) : '0.00';
              const stock = defaultVariant?.inventory?.stock ?? 0;
              const isOut = stock === 0;

              const isDrink = product.category.slug === 'soft-drinks' || product.category.slug === 'energy-drinks' || product.specs.volumeMl !== undefined;

              return (
                <div key={product.id} className={styles.card}>
                  <div className="p-6 flex flex-col h-full justify-between gap-4">
                    {/* Header */}
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-3">
                        <span className={isDrink ? styles.badgeDrink : styles.badgeBook}>
                          {product.category.name}
                        </span>
                        <span className="text-xs text-gray-500 font-mono">{defaultVariant?.sku}</span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-100 hover:text-white transition-colors duration-200">
                        {product.name}
                      </h3>
                      <p className="text-gray-400 text-sm mt-2 line-clamp-3 leading-relaxed">
                        {product.description}
                      </p>
                    </div>

                    {/* Metadata specs - dynamic beverage vs book specifications */}
                    <div className="bg-slate-950/40 p-4 rounded-xl border border-white/5 space-y-2">
                      {isDrink ? (
                        <>
                          <div className="flex justify-between text-xs text-gray-400">
                            <span>Volume</span>
                            <span className="font-semibold text-gray-200">{product.specs.volumeMl}ml ({product.specs.packagingType})</span>
                          </div>
                          <div className="flex justify-between text-xs text-gray-400">
                            <span>Sugar / Caffeine</span>
                            <span className="font-semibold text-gray-200">{product.specs.sugarGrams}g / {product.specs.caffeineMg}mg</span>
                          </div>
                          <div className="text-[10px] text-gray-500 line-clamp-1">
                            Ingredients: {product.specs.ingredients?.join(', ')}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex justify-between text-xs text-gray-400">
                            <span>Author</span>
                            <span className="font-semibold text-gray-200">{product.specs.author}</span>
                          </div>
                          <div className="flex justify-between text-xs text-gray-400">
                            <span>Pages / Year</span>
                            <span className="font-semibold text-gray-200">{product.specs.pageCount} pages ({product.specs.publishYear})</span>
                          </div>
                          <div className="flex justify-between text-[10px] text-gray-500">
                            <span>ISBN: {product.specs.isbn}</span>
                            <span>Lang: {product.specs.language}</span>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Price, Stock and Actions */}
                    <div className="flex items-center justify-between mt-2 pt-3 border-t border-white/5">
                      <div>
                        <span className="text-xs text-gray-400 block font-medium">Price</span>
                        <span className="text-2xl font-black text-white">${price}</span>
                      </div>
                      <div>
                        {isOut ? (
                          <button
                            disabled
                            className="bg-gray-800 text-gray-500 text-xs px-4 py-2.5 rounded-xl cursor-not-allowed font-semibold"
                          >
                            Out of Stock
                          </button>
                        ) : (
                          <button
                            onClick={() => quickAdd(product.id, defaultVariant.id)}
                            disabled={addToCartMutation.isPending}
                            className={styles.quickAddBtn}
                          >
                            {addToCartMutation.isPending ? 'Adding...' : 'Add to Cart'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
