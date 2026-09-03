'use client';

import Form from "@/components/PopUp";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { IoMdAdd } from "react-icons/io";
import axios from "axios";
import {useState} from "react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function CategoryPage() {

  const [ openModel , setOpenModel ] = useState(false)
  const [ categoryName , setCategoryName ] = useState("")

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';



  // Fetch Categories
  const { data: categoriesData, isLoading, isError, error } = useQuery<{ status: string; data: Category[] }>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/products/categories`);
      return res.data;
    },
  });


  const clientQuery = useQueryClient();
  const createCategory = useMutation({
    mutationFn: async (name: string) => {
      const res = await axios.post(`${API_URL}/products/categories`, { name });
      return res.data;
    },
    onSuccess: () => {
      clientQuery.invalidateQueries({ queryKey: ['categories'] });
      setCategoryName('');
      setOpenModel(false);
    },
  });

  const handleCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) return;
    createCategory.mutate(categoryName);
  };

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
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
            {[1, 2, 3 , 4].map((n) => (
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
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <div onClick={() => setOpenModel(true)} className="h-44 bg-slate-900/80 border-2 border-dashed border-gray-800 hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10 rounded-2xl p-6 transition-all duration-300 hover-shadow-indigo-500/10 flex flex-col justify-center items-center hover:cursor-pointer " >
            <IoMdAdd  className="text-5xl text-gray-800"  />
            </div>
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="bg-slate-900/80 h-44 border border-gray-800 hover:border-indigo-500/50 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/10 flex flex-col justify-between hover:cursor-pointer "
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-bold text-gray-100">{cat.name}</h2>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono max-w-[120px] truncate">
                      /{cat.slug}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Form modelOpen={openModel} setModelOpen={setOpenModel}>
          <form onSubmit={handleCategory}>
            <input
              // label="Category Name"
              placeholder="Enter category name"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="border-none outline-none p-2 w-full rounded"
            />
            <button
              className="mt-4 h-10 w-full text-white flex items-center justify-center border border-gray-500 rounded cursor-pointer disabled:opacity-50 hover:bg-slate-800 transition-colors"
              type="submit"
              disabled={createCategory.isPending}
            >
              {createCategory.isPending ? 'Submitting...' : 'Submit'}
            </button>
          </form>
        </Form>
      </div>
    </main>
  );
}

 