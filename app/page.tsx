"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Sparkles, Zap, ArrowRight, Clock, Box, Code2,
  ChevronRight, Layers, Shield, Wand2, BarChart2, Table2,
  LayoutDashboard, FormInput
} from "lucide-react";
import { GeneratedApp } from "@/types";

const EXAMPLE_PROMPTS = [
  "CRM dashboard for a SaaS startup with pipeline, contacts, and deals management",
  "E-commerce admin panel with product catalog, orders, inventory and analytics",
  "HR management system with employee profiles, leave tracker and payroll overview",
  "Project management tool with kanban board, team members and sprint tracking",
  "Restaurant POS system with menu management, orders and daily revenue stats",
  "Healthcare patient portal with appointments, prescriptions and billing",
  "School management system with students, classes, grades and attendance",
  "Real estate listing platform with property search, agents and lead forms",
];

const FEATURE_CARDS = [
  { icon: Zap, title: "Groq-Powered Speed", desc: "LLaMA 3.3 70B via Groq generates your entire app config in seconds — not minutes.", color: "from-pink-400 to-rose-400" },
  { icon: Layers, title: "10+ Component Types", desc: "Forms, tables, kanban, charts, timelines, galleries, stats cards, hero sections and more.", color: "from-purple-400 to-violet-500" },
  { icon: Shield, title: "Bulletproof Sanitizer", desc: "Invalid configs, unknown fields and broken JSON are all handled gracefully — zero crashes.", color: "from-indigo-400 to-blue-500" },
  { icon: Code2, title: "Full JSON Control", desc: "View and export the raw config for every app. Use it in your own systems.", color: "from-fuchsia-400 to-pink-500" },
];

const COMPONENT_BADGES = [
  { icon: FormInput, label: "Forms" },
  { icon: Table2, label: "Tables" },
  { icon: BarChart2, label: "Charts" },
  { icon: LayoutDashboard, label: "Kanban" },
  { icon: Wand2, label: "Timelines" },
  { icon: Box, label: "Galleries" },
];

export default function HomePage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [recentApps, setRecentApps] = useState<GeneratedApp[]>([]);
  const [exampleIdx, setExampleIdx] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetch("/api/apps")
      .then((r) => r.json())
      .then((d) => setRecentApps(d.apps?.slice(0, 6) ?? []))
      .catch(() => {});
    const iv = setInterval(() => setExampleIdx((c) => (c + 1) % EXAMPLE_PROMPTS.length), 3500);
    return () => clearInterval(iv);
  }, []);

  async function handleGenerate() {
    if (!prompt.trim()) {
      toast.error("Please describe your app first");
      textareaRef.current?.focus();
      return;
    }
    if (prompt.trim().length < 10) {
      toast.error("Please provide a more detailed description (min 10 chars)");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Generation failed");
      toast.success(`✨ "${data.app.name}" generated!`);
      router.push(`/apps/${data.app.id}`);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to generate. Check your GROQ_API_KEY.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Layered background */}
      <div className="fixed inset-0 animated-gradient -z-10" />
      <div className="fixed top-0 right-0 w-[600px] h-[600px] rounded-full bg-purple-300 opacity-20 blur-[120px] -z-10 translate-x-1/3 -translate-y-1/4" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-pink-300 opacity-20 blur-[100px] -z-10 -translate-x-1/3 translate-y-1/4" />
      <div className="fixed top-1/2 left-1/2 w-[300px] h-[300px] rounded-full bg-indigo-200 opacity-15 blur-[80px] -z-10 -translate-x-1/2 -translate-y-1/2" />

      {/* Navbar */}
      <nav className="glass sticky top-0 z-50 border-b border-purple-100/60">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-400 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-200">
              <Sparkles className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <span className="font-black text-xl tracking-tight" style={{ fontFamily: "Syne, sans-serif", color: "#1e1b4b" }}>AppForge</span>
              <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-gradient-to-r from-pink-100 to-purple-100 text-purple-600 border border-purple-100 font-medium">AI</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => router.push("/dashboard")} className="px-4 py-2 text-sm font-semibold rounded-xl border border-purple-200 text-purple-700 hover:bg-purple-50 transition-all">
              My Apps
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="px-5 py-2 text-sm font-semibold rounded-xl text-white shadow-md shadow-purple-200 transition-all hover:shadow-lg hover:shadow-purple-300 hover:scale-105"
              style={{ background: "linear-gradient(135deg, #ec4899, #a855f7)" }}
            >
              Dashboard →
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-12 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-8 glass border border-purple-200 text-purple-700 shadow-sm">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          Powered by Groq AI — LLaMA 3.3 70B
          <span className="text-pink-400">⚡</span>
        </div>

        <h1 className="text-6xl md:text-7xl font-black mb-6 leading-[1.05] tracking-tight" style={{ fontFamily: "Syne, sans-serif" }}>
          <span className="gradient-text">Generate Any App</span>
          <br />
          <span className="text-indigo-900">In One Sentence</span>
        </h1>

        <p className="text-xl text-purple-600 mb-4 max-w-2xl mx-auto leading-relaxed font-light">
          Describe your app in plain language. AppForge instantly generates a complete,
          interactive application with forms, tables, dashboards, charts, and workflows.
        </p>

        {/* Component type badges */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {COMPONENT_BADGES.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass border border-purple-100 text-xs font-semibold text-purple-600">
              <Icon className="w-3 h-3 text-pink-500" /> {label}
            </div>
          ))}
        </div>

        {/* Main Prompt Box */}
        <div className="glass rounded-2xl shadow-2xl shadow-purple-200/50 max-w-3xl mx-auto border border-purple-200/60 overflow-hidden">
          <div className="px-2 pt-2">
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={`e.g. "${EXAMPLE_PROMPTS[exampleIdx]}"`}
              className="w-full bg-transparent px-4 pt-4 pb-2 text-base resize-none text-indigo-900 placeholder-purple-300 focus:outline-none min-h-[100px] leading-relaxed"
              style={{ fontFamily: "DM Sans, sans-serif" }}
              onKeyDown={(e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleGenerate(); }}
            />
          </div>
          <div className="px-4 pb-4 flex items-center justify-between">
            <span className="text-xs text-purple-400 font-medium">⌘+Enter to generate</span>
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="flex items-center gap-2 px-7 py-3 rounded-xl text-white font-bold text-sm shadow-lg shadow-pink-200 transition-all hover:shadow-xl hover:scale-105 disabled:opacity-60 disabled:scale-100 disabled:cursor-not-allowed"
              style={{ background: loading ? "#c084fc" : "linear-gradient(135deg, #ec4899, #a855f7)" }}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Building your app...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate App
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick example pills */}
        <div className="flex flex-wrap justify-center gap-2 mt-5">
          <span className="text-xs text-purple-400 font-medium mr-1 mt-1">Try:</span>
          {EXAMPLE_PROMPTS.slice(0, 4).map((ex, i) => (
            <button
              key={i}
              onClick={() => { setPrompt(ex); textareaRef.current?.focus(); }}
              className="px-3 py-1.5 rounded-full text-xs font-medium border border-purple-200 text-purple-600 hover:border-pink-300 hover:text-pink-600 hover:bg-pink-50/50 transition-all"
            >
              {ex.split(" ").slice(0, 4).join(" ")}…
            </button>
          ))}
        </div>
      </section>

      {/* Feature Grid */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-black text-indigo-900 text-center mb-10" style={{ fontFamily: "Syne, sans-serif" }}>
          Everything you need, <span className="gradient-text">instantly</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURE_CARDS.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="glass rounded-2xl p-5 border border-purple-100 card-hover group">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-indigo-900 mb-2 text-sm" style={{ fontFamily: "Syne, sans-serif" }}>{title}</h3>
              <p className="text-xs text-purple-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Apps */}
      {recentApps.length > 0 && (
        <section className="max-w-5xl mx-auto px-6 pb-24">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-indigo-900" style={{ fontFamily: "Syne, sans-serif" }}>
              Recently Generated
            </h2>
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-1 text-sm text-purple-500 hover:text-pink-500 transition-colors font-semibold"
            >
              View all <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentApps.map((app) => (
              <button
                key={app.id}
                onClick={() => router.push(`/apps/${app.id}`)}
                className="glass rounded-2xl p-5 text-left border border-purple-100 card-hover group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-300 to-purple-400 flex items-center justify-center shadow-sm">
                    <Box className="w-4 h-4 text-white" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-purple-300 group-hover:text-pink-400 group-hover:translate-x-0.5 transition-all" />
                </div>
                <h3 className="font-bold text-indigo-900 mb-1 text-sm truncate" style={{ fontFamily: "Syne, sans-serif" }}>{app.name}</h3>
                <p className="text-xs text-purple-400 truncate mb-3">{app.prompt}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-purple-300">
                    <Clock className="w-3 h-3" />
                    {new Date(app.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </div>
                  {app.config?.pages && (
                    <span className="text-xs text-purple-400">{app.config.pages.length} page{app.config.pages.length !== 1 ? "s" : ""}</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="glass border-t border-purple-100 py-8 mt-4">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-purple-400">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold text-indigo-700" style={{ fontFamily: "Syne, sans-serif" }}>AppForge</span>
            <span>— AI App Generator</span>
          </div>
          <p>Track A · Full Stack · Internship Demo · Built with Next.js + Groq</p>
        </div>
      </footer>
    </div>
  );
}
