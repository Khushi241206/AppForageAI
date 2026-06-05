"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Sparkles, Plus, Search, Trash2, ExternalLink,
  Clock, Box, ArrowLeft, LayoutGrid, List, Filter
} from "lucide-react";
import { GeneratedApp } from "@/types";

export default function DashboardPage() {
  const router = useRouter();
  const [apps, setApps] = useState<GeneratedApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [view, setView] = useState<"grid" | "list">("grid");

  const fetchApps = useCallback(async () => {
    try {
      const res = await fetch("/api/apps");
      const d = await res.json();
      setApps(d.apps ?? []);
    } catch { toast.error("Failed to load apps"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchApps(); }, [fetchApps]);

  const filtered = apps.filter(
    (a) => a.name.toLowerCase().includes(search.toLowerCase()) ||
           a.prompt.toLowerCase().includes(search.toLowerCase())
  );

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("Delete this app?")) return;
    setDeleting(id);
    try {
      await fetch(`/api/apps/${id}`, { method: "DELETE" });
      setApps((prev) => prev.filter((a) => a.id !== id));
      toast.success("App deleted");
    } catch { toast.error("Failed to delete"); }
    finally { setDeleting(null); }
  }

  const COLORS = [
    "from-pink-400 to-rose-400",
    "from-purple-400 to-violet-500",
    "from-indigo-400 to-blue-400",
    "from-fuchsia-400 to-pink-400",
    "from-violet-400 to-purple-500",
    "from-rose-400 to-pink-500",
  ];

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 animated-gradient -z-10" />
      <div className="fixed top-0 right-0 w-[500px] h-[500px] rounded-full bg-purple-200 opacity-20 blur-[100px] -z-10" />

      {/* Navbar */}
      <nav className="glass sticky top-0 z-50 border-b border-purple-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push("/")} className="p-2 rounded-xl hover:bg-purple-50 text-purple-400 hover:text-purple-600 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-400 to-purple-600 flex items-center justify-center shadow-md">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-black text-lg" style={{ fontFamily: "Syne, sans-serif", color: "#1e1b4b" }}>AppForge</span>
            </div>
          </div>
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold shadow-md hover:shadow-lg hover:scale-105 transition-all"
            style={{ background: "linear-gradient(135deg, #ec4899, #a855f7)" }}
          >
            <Plus className="w-4 h-4" /> New App
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-indigo-900 mb-1" style={{ fontFamily: "Syne, sans-serif" }}>My Apps</h1>
          <p className="text-purple-500">{apps.length} app{apps.length !== 1 ? "s" : ""} generated</p>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 mb-8 flex-wrap">
          <div className="glass rounded-xl px-4 py-2.5 flex items-center gap-2.5 border border-purple-100 flex-1 min-w-[200px] max-w-sm">
            <Search className="w-4 h-4 text-purple-300 flex-shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search apps..."
              className="bg-transparent flex-1 text-sm text-indigo-900 placeholder-purple-300 focus:outline-none"
            />
            {search && (
              <button onClick={() => setSearch("")} className="text-purple-300 hover:text-purple-500 text-xs font-medium">✕</button>
            )}
          </div>
          <div className="flex items-center gap-1 glass rounded-xl border border-purple-100 p-1">
            <button
              onClick={() => setView("grid")}
              className={`p-2 rounded-lg transition-all ${view === "grid" ? "bg-purple-100 text-purple-700" : "text-purple-400 hover:text-purple-600"}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView("list")}
              className={`p-2 rounded-lg transition-all ${view === "list" ? "bg-purple-100 text-purple-700" : "text-purple-400 hover:text-purple-600"}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          {search && (
            <div className="flex items-center gap-1.5 text-xs text-purple-400 glass px-3 py-2 rounded-lg border border-purple-100">
              <Filter className="w-3 h-3" /> {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </div>
          )}
        </div>

        {/* Loading */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1,2,3,4,5,6].map((i) => (
              <div key={i} className="glass rounded-2xl p-6 border border-purple-100">
                <div className="shimmer rounded-xl h-10 w-10 mb-4" />
                <div className="shimmer rounded-lg h-5 w-3/4 mb-2" />
                <div className="shimmer rounded h-3 w-full mb-1.5" />
                <div className="shimmer rounded h-3 w-2/3 mb-4" />
                <div className="shimmer rounded-full h-4 w-20" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-28">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-pink-50 to-purple-100 flex items-center justify-center mx-auto mb-5 border border-purple-100">
              <Box className="w-10 h-10 text-purple-300" />
            </div>
            <h3 className="text-2xl font-black text-indigo-900 mb-2" style={{ fontFamily: "Syne, sans-serif" }}>
              {search ? "No apps found" : "No apps yet"}
            </h3>
            <p className="text-purple-400 mb-8 max-w-xs mx-auto">
              {search ? "Try a different search term" : "Generate your first app from a natural language prompt"}
            </p>
            {!search && (
              <button
                onClick={() => router.push("/")}
                className="px-8 py-3.5 rounded-xl text-white font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105"
                style={{ background: "linear-gradient(135deg, #ec4899, #a855f7)" }}
              >
                ✨ Create Your First App
              </button>
            )}
          </div>
        ) : view === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((app, idx) => (
              <div
                key={app.id}
                onClick={() => router.push(`/apps/${app.id}`)}
                className="glass rounded-2xl p-6 border border-purple-100 card-hover group cursor-pointer relative"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${COLORS[idx % COLORS.length]} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                    <Box className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                    <button
                      onClick={(e) => { e.stopPropagation(); router.push(`/apps/${app.id}`); }}
                      className="p-1.5 rounded-lg hover:bg-purple-50 text-purple-300 hover:text-purple-600 transition-colors"
                      title="Open app"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(app.id, e)}
                      disabled={deleting === app.id}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-purple-300 hover:text-red-400 transition-colors"
                      title="Delete app"
                    >
                      {deleting === app.id
                        ? <div className="w-3.5 h-3.5 border-2 border-red-300 border-t-transparent rounded-full animate-spin" />
                        : <Trash2 className="w-3.5 h-3.5" />
                      }
                    </button>
                  </div>
                </div>
                <h3 className="font-bold text-indigo-900 mb-1.5 text-sm group-hover:text-purple-700 transition-colors" style={{ fontFamily: "Syne, sans-serif" }}>
                  {app.name}
                </h3>
                <p className="text-xs text-purple-400 mb-4 line-clamp-2 leading-relaxed">{app.prompt}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-purple-300">
                    <Clock className="w-3 h-3" />
                    {new Date(app.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </div>
                  {app.config?.pages && (
                    <span className="text-xs text-purple-400 font-medium">{app.config.pages.length}p</span>
                  )}
                </div>
                {app.config?.pages && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {app.config.pages.slice(0, 3).map((p) => (
                      <span key={p.id} className="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-500 border border-purple-100 font-medium">
                        {p.icon} {p.name}
                      </span>
                    ))}
                    {app.config.pages.length > 3 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-50 text-pink-500 border border-pink-100 font-medium">
                        +{app.config.pages.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          // List view
          <div className="glass rounded-2xl border border-purple-100 overflow-hidden divide-y divide-purple-50">
            {filtered.map((app, idx) => (
              <div
                key={app.id}
                onClick={() => router.push(`/apps/${app.id}`)}
                className="flex items-center gap-4 px-6 py-4 hover:bg-purple-50/40 transition-colors cursor-pointer group"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${COLORS[idx % COLORS.length]} flex items-center justify-center shadow-sm flex-shrink-0`}>
                  <Box className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-indigo-900 text-sm group-hover:text-purple-700 transition-colors" style={{ fontFamily: "Syne, sans-serif" }}>
                    {app.name}
                  </h3>
                  <p className="text-xs text-purple-400 truncate">{app.prompt}</p>
                </div>
                <div className="text-xs text-purple-300 flex-shrink-0 hidden md:block">
                  {new Date(app.createdAt).toLocaleDateString()}
                </div>
                <button
                  onClick={(e) => handleDelete(app.id, e)}
                  disabled={deleting === app.id}
                  className="p-2 rounded-lg hover:bg-red-50 text-purple-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
