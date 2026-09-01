import Link from 'next/link';

export default function Home() {
  let themeClasses = 'bg-slate-900 border border-gray-850 text-gray-300 hover:bg-slate-800 hover:text-white';

  return (
    <main className="flex-1 flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-6">
      <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 mb-8">
        Welcome to Soft Drink & Books Monorepo
      </h1>
      
      <div className="flex flex-wrap gap-4 justify-center">
        <Link 
          href="/category" 
          className={`px-5 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 ${themeClasses} hover:cursor-pointer`}
        >
          Go To Application
        </Link>
      </div>
    </main>
  );
}
