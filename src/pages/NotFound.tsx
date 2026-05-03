import { Link } from "wouter";
import { Home as HomeIcon } from "lucide-react";

export default function NotFound() {
  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-go-cyan text-white font-mono text-3xl font-bold mb-4 shadow-lg">Go</div>
      <h1 className="text-4xl font-bold text-go-cyan-dark dark:text-go-cyan mb-2">404</h1>
      <p className="text-slate-600 dark:text-slate-300 mb-8">
        Esta página não existe. Talvez o gopher tenha cavado um buraco e levado ela.
      </p>
      <Link href="/" className="inline-flex items-center gap-2 bg-go-cyan hover:bg-go-cyan-dark text-white px-5 py-2.5 rounded-lg font-semibold transition-colors">
        <HomeIcon size={18} /> Voltar ao início
      </Link>
    </div>
  );
}
