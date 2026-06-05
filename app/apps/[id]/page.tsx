"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Sparkles, ArrowLeft, Code, Eye, EyeOff, ChevronRight,
  Settings, Wand2, X, AlertTriangle, Download, RefreshCw,
  Copy, Check, LayoutDashboard
} from "lucide-react";
import { GeneratedApp, PageConfig } from "@/types";
import { ComponentRenderer } from "@/components/renderer/ComponentRenderer";

export default function AppViewerPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [app, setApp] = useState<GeneratedApp | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState(0);
  const [showJson, setShowJson] = useState(false);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [showWarnings, setShowWarnings] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [editPrompt, setEditPrompt] = useState("");
  const [showEditPanel, setShowEditPanel] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const fetchApp = useCallback(async () => {
    try {
      const res = await fetch(`/api/apps/${id}`);
      const d = await res.json();
      if (!d.success) { toast.error("App not found"); router.push("/dashboard"); return; }
      setApp(d.app);
      if (d.warnings?.length) setWarnings(d.warnings);
    } catch { toast.error("Failed to load app"); }
    finally { setLoading(false); }
  }, [id, router]);

  useEffect(() => { fetchApp(); }, [fetchApp]);

  async function handleAiEdit() {
    if (!editPrompt.trim() || !app) return;
    setRegenerating(true);
    try {
      const res = await fetch(`/api/apps/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "regenerate-component",
          componentId: app.config?.pages?.[activePage]?.components?.[0]?.id ?? "all",
          instructions: editPrompt,
        }),
      });
      const d = await res.json();
      if (!d.success) throw new Error(d.error || "Update failed");
      setApp(d.app);
      setEditPrompt("");
      setShowEditPanel(false);
      toast.success("✨ App updated successfully!");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    } finally { setRegenerating(false); }
  }

  function handleCopyJson() {
    if (!app) return;
    navigator.clipboard.writeText(JSON.stringify(app.config, null, 2));
    setCopied(true);
    toast.success("JSON copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownloadJson() {
    if (!app) return;
    const blob = new Blob([JSON.stringify(app.config, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${app.name.replace(/\s+/g, "-").toLowerCase()}-config.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Config downloaded!");
  }

  if (loading) return (
    <div className="min-h-screen animated-gradient flex items-center justify-center">
      <div className="text-center glass rounded-2xl p-12 border border-purple-100">
        <div className="w-14 h-14 border-4 border-purple-200 border-t-pink-500 rounded-full animate-spin mx-auto mb-5" />
        <p className="text-purple-600 font-semibold" style={{ fontFamily: "Syne, sans-serif" }}>Loading your app...</p>
        <p className="text-purple-400 text-sm mt-1">Preparing the renderer</p>
      </div>
    </div>
  );

  if (!app) return null;

  const pages = app.config?.pages ?? [];
  const currentPage: PageConfig | undefined = pages[activePage];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(135deg, #fdf2f8 0%, #faf5ff 50%, #ede9fe 100%)" }}>

      {/* Top Navigation Bar */}
      <header className="glass sticky top-0 z-50 border-b border-purple-100">
        <div className="px-4 py-3 flex items-center justify-between gap-3">
          {/* Left: back + title */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => router.push("/dashboard")}
              className="p-2 rounded-xl hover:bg-purple-50 text-purple-400 hover:text-purple-600 transition-colors flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-400 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-md">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-black text-indigo-900 truncate" style={{ fontFamily: "Syne, sans-serif" }}>
                {app.name}
              </h1>
              <p className="text-xs text-purple-400 truncate max-w-[300px] hidden md:block">{app.prompt}</p>
            </div>
          </div>

          {/* Right: action buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {warnings.length > 0 && (
              <button
                onClick={() => setShowWarnings(!showWarnings)}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-100 text-amber-600 text-xs font-semibold hover:bg-amber-100 transition-colors"
              >
                <AlertTriangle className="w-3 h-3" />
                {warnings.length} warning{warnings.length !== 1 ? "s" : ""}
              </button>
            )}
            <button
              onClick={() => setShowEditPanel(!showEditPanel)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                showEditPanel
                  ? "bg-gradient-to-r from-pink-50 to-purple-50 border-purple-200 text-purple-700"
                  : "border-purple-100 text-purple-500 hover:bg-purple-50 hover:text-purple-700"
              }`}
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Edit with AI</span>
            </button>
            <button
              onClick={() => setShowJson(!showJson)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                showJson
                  ? "bg-purple-100 border-purple-200 text-purple-700"
                  : "border-purple-100 text-purple-400 hover:bg-purple-50 hover:text-purple-600"
              }`}
            >
              {showJson ? <EyeOff className="w-3.5 h-3.5" /> : <Code className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">JSON</span>
            </button>
            <button
              onClick={handleDownloadJson}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-purple-100 text-purple-400 hover:bg-purple-50 hover:text-purple-600 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        {/* Page tabs (shown when <= 5 pages) */}
        {pages.length > 1 && pages.length <= 7 && (
          <div className="px-4 flex gap-0.5 overflow-x-auto border-t border-purple-50 pb-0">
            {pages.map((page, i) => (
              <button
                key={page.id}
                onClick={() => setActivePage(i)}
                className={`px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-all border-b-2 ${
                  activePage === i
                    ? "border-pink-500 text-pink-600 bg-pink-50/30"
                    : "border-transparent text-purple-400 hover:text-purple-600 hover:border-purple-200"
                }`}
              >
                {page.icon && <span className="mr-1">{page.icon}</span>}
                {page.name}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Warnings panel */}
      {showWarnings && warnings.length > 0 && (
        <div className="bg-amber-50 border-b border-amber-100 px-6 py-3">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-amber-700 mb-1.5">Config Warnings ({warnings.length})</p>
                <ul className="space-y-0.5">
                  {warnings.map((w, i) => (
                    <li key={i} className="text-xs text-amber-600 flex items-start gap-1.5">
                      <span className="mt-0.5 flex-shrink-0">•</span> {w}
                    </li>
                  ))}
                </ul>
              </div>
              <button onClick={() => setShowWarnings(false)} className="text-amber-400 hover:text-amber-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Edit Panel */}
      {showEditPanel && (
        <div className="glass border-b border-purple-100 shadow-sm">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Wand2 className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-purple-700 mb-2">Edit with AI — describe what you want to change</p>
              <textarea
                value={editPrompt}
                onChange={(e) => setEditPrompt(e.target.value)}
                placeholder="e.g. 'Add a revenue analytics chart', 'Change the form to have address fields', 'Add a settings page with notification toggles'..."
                rows={2}
                className="w-full px-4 py-3 rounded-xl border border-purple-100 bg-white/70 text-sm text-indigo-900 placeholder-purple-300 resize-none focus:outline-none focus:border-purple-300 transition-all"
                onKeyDown={(e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleAiEdit(); }}
              />
              <p className="text-xs text-purple-300 mt-1">⌘+Enter to apply</p>
            </div>
            <div className="flex gap-2 pt-6">
              <button
                onClick={handleAiEdit}
                disabled={regenerating || !editPrompt.trim()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold shadow-md disabled:opacity-50 transition-all hover:shadow-lg hover:scale-105"
                style={{ background: "linear-gradient(135deg, #ec4899, #a855f7)" }}
              >
                {regenerating ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Wand2 className="w-4 h-4" />}
                {regenerating ? "Updating..." : "Apply"}
              </button>
              <button
                onClick={() => { setShowEditPanel(false); setEditPrompt(""); }}
                className="p-2.5 rounded-xl border border-purple-100 text-purple-400 hover:bg-purple-50 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar */}
        {pages.length > 1 && (
          <aside className={`${sidebarOpen ? "w-56" : "w-0 overflow-hidden"} hidden lg:block flex-shrink-0 glass border-r border-purple-100 transition-all duration-300`}>
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Pages</p>
                <span className="text-[10px] text-purple-300">{pages.length} total</span>
              </div>
              <nav className="space-y-1">
                {pages.map((page, i) => (
                  <button
                    key={page.id}
                    onClick={() => setActivePage(i)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all ${
                      activePage === i
                        ? "bg-gradient-to-r from-pink-50 to-purple-50 text-purple-700 border border-purple-100 font-bold shadow-sm"
                        : "text-purple-400 hover:bg-purple-50/50 hover:text-purple-600 font-medium"
                    }`}
                  >
                    <span className="text-base">{page.icon ?? "📄"}</span>
                    <span className="truncate flex-1 text-left">{page.name}</span>
                    {activePage === i && <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />}
                  </button>
                ))}
              </nav>

              {/* Component count summary */}
              {currentPage && (
                <div className="mt-6 pt-4 border-t border-purple-50">
                  <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-3">This Page</p>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-purple-400">Components</span>
                      <span className="font-bold text-purple-600">{currentPage.components.length}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </aside>
        )}

        {/* Main canvas */}
        <main className="flex-1 overflow-auto">
          {showJson ? (
            <div className="p-6 max-w-4xl mx-auto">
              <div className="glass rounded-2xl border border-purple-100 overflow-hidden shadow-lg">
                <div className="px-6 py-4 border-b border-purple-50 flex items-center justify-between bg-white/30">
                  <div>
                    <h3 className="text-sm font-black text-indigo-900" style={{ fontFamily: "Syne, sans-serif" }}>App Configuration JSON</h3>
                    <p className="text-xs text-purple-400 mt-0.5">The metadata config that drives your entire app</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCopyJson}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-purple-100 text-xs font-semibold text-purple-600 hover:bg-purple-50 transition-colors"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? "Copied!" : "Copy"}
                    </button>
                    <button
                      onClick={handleDownloadJson}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-purple-100 text-xs font-semibold text-purple-600 hover:bg-purple-50 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" /> Download
                    </button>
                  </div>
                </div>
                <pre className="p-6 text-xs text-purple-700 overflow-auto max-h-[calc(100vh-280px)] leading-relaxed font-mono">
                  {JSON.stringify(app.config, null, 2)}
                </pre>
              </div>
            </div>
          ) : !currentPage ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <LayoutDashboard className="w-10 h-10 text-purple-200 mb-3" />
              <p className="text-purple-400 font-medium">No pages in this app</p>
              <button
                onClick={() => setShowEditPanel(true)}
                className="mt-4 text-sm text-pink-500 hover:text-pink-600 font-semibold"
              >
                Add pages with AI →
              </button>
            </div>
          ) : (
            <div className="p-6 max-w-6xl mx-auto">
              {/* Page header */}
              <div className="mb-8">
                <div className="flex items-center gap-3">
                  {currentPage.icon && (
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center text-xl border border-purple-100">
                      {currentPage.icon}
                    </div>
                  )}
                  <div>
                    <h2 className="text-3xl font-black text-indigo-900" style={{ fontFamily: "Syne, sans-serif" }}>
                      {currentPage.name}
                    </h2>
                    {activePage === 0 && app.config?.description && (
                      <p className="text-purple-400 text-sm mt-0.5">{app.config.description}</p>
                    )}
                  </div>
                  <div className="ml-auto hidden md:flex items-center gap-2">
                    <button
                      onClick={fetchApp}
                      className="p-2 rounded-xl border border-purple-100 text-purple-400 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                      title="Refresh"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setShowEditPanel(true)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-purple-600 border border-purple-100 hover:bg-purple-50 transition-colors"
                    >
                      <Wand2 className="w-3.5 h-3.5" /> Edit page
                    </button>
                  </div>
                </div>
              </div>

              {/* Components */}
              {currentPage.components.length === 0 ? (
                <div className="text-center py-20 glass rounded-2xl border border-purple-100">
                  <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center mx-auto mb-4 border border-purple-100">
                    <Settings className="w-8 h-8 text-purple-200" />
                  </div>
                  <p className="text-purple-400 font-medium">No components on this page</p>
                  <button
                    onClick={() => setShowEditPanel(true)}
                    className="mt-3 text-sm text-pink-500 hover:text-pink-600 font-semibold"
                  >
                    Add components with AI →
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {currentPage.components.map((comp) => (
                    <div key={comp.id} className="group relative">
                      <ComponentRenderer config={comp} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
