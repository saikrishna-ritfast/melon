'use client';

import { useQuery } from "@tanstack/react-query";

interface Category {
  id: string;
  name: string;
  slug: string;
  children?: Category[];
}

export default function CategoryPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

  // Fetch Categories
  const { data: categoriesData, isLoading, isError, error } = useQuery<{ status: string; data: Category[] }>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/products/categories`);
      if (!res.ok) throw new Error('Failed to fetch categories');
      return res.json();
    },
  });

  console.log(categoriesData);

  const categories = categoriesData?.data || [];

  return (
    <main className="flex-1 p-8 text-white">
      <div className="max-w-8xl">
        <div className="mb-8">
          <h1 className="text-white text-bold text-3xl">
            Categories
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Manage and explore product categories and subcategories
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3 ].map((n) => (
              <div key={n} className="h-44 bg-slate-900/50 rounded-2xl border border-gray-800 p-6">
                <div className="h-4 w-32 bg-slate-800 rounded mb-4"></div>
                <div className="h-4 w-48 bg-slate-800/60 rounded mb-2"></div>
                <div className="h-4 w-24 bg-slate-800/40 rounded"></div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="p-6 bg-red-950/40 border border-red-800/60 rounded-2xl text-red-200">
            <h3 className="font-semibold text-lg mb-1">Failed to load categories</h3>
            <p className="text-sm text-red-300/80">
              {error instanceof Error ? error.message : 'An unexpected error occurred.'}
            </p>
          </div>
        )}

        {/* Categories List */}
        {!isLoading && !isError && categories.length === 0 && (
          <div className="text-center py-16 bg-slate-900/30 border border-gray-800 rounded-2xl text-gray-400">
            No categories found.
          </div>
        )}
  
        {!isLoading && !isError && categories.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="h-44 bg-slate-900/80 border-2 border-dashed border-gray-800 hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10 rounded-2xl p-6 transition-all duration-300 hover-shadow-indigo-500/10 flex flex-col justify-center items-center hover:cursor-pointer " >
            + Add Category
            </div>
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="bg-slate-900/80 border border-gray-800 hover:border-indigo-500/50 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/10 flex flex-col justify-between hover:cursor-pointer "
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-bold text-gray-100">{cat.name}</h2>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
                      /{cat.slug}
                    </span>
                  </div>
                </div>

                {cat.children && cat.children.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-800/80">
                    <span className="text-xs text-gray-400 font-medium block mb-2">Subcategories:</span>
                    <div className="flex flex-wrap gap-2">
                      {cat.children.map((child) => (
                        <span
                          key={child.id}
                          className="px-3 py-1 bg-slate-800 text-gray-300 text-xs rounded-lg border border-gray-700/50 font-medium"
                        >
                          {child.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

 