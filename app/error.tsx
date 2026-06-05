"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  const router = useRouter();
  return (
    <div className="min-h-screen animated-gradient flex flex-col items-center justify-center text-center px-6">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center mb-6 shadow-xl">
        <AlertTriangle className="w-8 h-8 text-white" />
      </div>
      <h2 className="text-3xl font-black text-indigo-900 mb-3" style={{fontFamily:"Syne,sans-serif"}}>Something went wrong</h2>
      <p className="text-purple-600 mb-8 max-w-md">{error.message || "An unexpected error occurred."}</p>
      <div className="flex gap-3">
        <button onClick={reset} className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all" style={{background:"linear-gradient(135deg,#ec4899,#a855f7)"}}>
          <RefreshCw className="w-4 h-4" /> Try Again
        </button>
        <button onClick={() => router.push("/")} className="px-6 py-3 rounded-xl border border-purple-200 text-purple-700 hover:bg-purple-50 transition-all font-semibold">
          Home
        </button>
      </div>
    </div>
  );
}
