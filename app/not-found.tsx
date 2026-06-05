"use client";
import { useRouter } from "next/navigation";
import { Sparkles, Home } from "lucide-react";

export default function NotFound() {
  const router = useRouter();
  return (
    <div className="min-h-screen animated-gradient flex flex-col items-center justify-center text-center px-6">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-400 to-purple-600 flex items-center justify-center mb-6 shadow-xl float">
        <Sparkles className="w-8 h-8 text-white" />
      </div>
      <h1 className="text-6xl font-black text-indigo-900 mb-3" style={{fontFamily:"Syne,sans-serif"}}>404</h1>
      <p className="text-xl text-purple-600 mb-8">Page not found</p>
      <button
        onClick={() => router.push("/")}
        className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
        style={{background:"linear-gradient(135deg,#ec4899,#a855f7)"}}
      >
        <Home className="w-4 h-4" /> Back to Home
      </button>
    </div>
  );
}
