export default function AboutPage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-md text-center">
        <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 mb-4">
          About Our Marketplace
        </h1>
        <p className="text-gray-400 mb-8 leading-relaxed">
          This is an enterprise e-commerce demonstration monorepo featuring high-performance dynamic filtering for multiple categories such as beverages and books.
        </p>
        <a 
          href="/" 
          className="px-5 py-2.5 rounded-full font-semibold text-sm bg-slate-900 border border-gray-800 text-gray-300 hover:bg-slate-800 hover:text-white transition-all duration-300"
        >
          Back to Home
        </a>
      </div>
    </main>
  );
}
