"use client";

import { useState } from "react";
import { ComponentConfig, StatConfig, KanbanColumn } from "@/types";
import { TrendingUp, TrendingDown, Minus, Plus, GripVertical, Calendar, BarChart2 } from "lucide-react";

// ── Stats ─────────────────────────────────────────────────────────────────────

function TrendIcon({ trend }: { trend?: string }) {
  if (trend === "up") return <TrendingUp className="w-3.5 h-3.5 text-green-500" />;
  if (trend === "down") return <TrendingDown className="w-3.5 h-3.5 text-red-500" />;
  return <Minus className="w-3.5 h-3.5 text-purple-400" />;
}

export function StatsRenderer({ config }: { config: ComponentConfig }) {
  const stats = config.stats ?? [];
  return (
    <div className="space-y-3">
      {config.title && (
        <h3 className="text-lg font-bold text-indigo-900" style={{ fontFamily: "Syne, sans-serif" }}>{config.title}</h3>
      )}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat: StatConfig, i) => (
          <div key={i} className="glass rounded-2xl p-5 border border-purple-100 card-hover">
            <div className="flex items-start justify-between mb-3">
              <div className="text-2xl">{stat.icon ?? "📊"}</div>
              {stat.change && (
                <div className="flex items-center gap-1 text-xs font-medium">
                  <TrendIcon trend={stat.trend} />
                  <span className={stat.trend === "up" ? "text-green-600" : stat.trend === "down" ? "text-red-500" : "text-purple-500"}>
                    {stat.change}
                  </span>
                </div>
              )}
            </div>
            <div className="text-2xl font-bold text-indigo-900 mb-1" style={{ fontFamily: "Syne, sans-serif" }}>
              {String(stat.value)}
            </div>
            <div className="text-xs text-purple-500 font-medium">{stat.label}</div>
          </div>
        ))}
        {stats.length === 0 && (
          <div className="col-span-4 text-center py-8 text-purple-400 text-sm">No stats configured</div>
        )}
      </div>
    </div>
  );
}

// ── Chart (pure CSS bar chart) ────────────────────────────────────────────────

export function ChartRenderer({ config }: { config: ComponentConfig }) {
  const chart = config.chart;
  if (!chart) return (
    <div className="glass rounded-2xl p-6 border border-purple-100 text-center py-12">
      <BarChart2 className="w-8 h-8 text-purple-300 mx-auto mb-2" />
      <p className="text-purple-400 text-sm">No chart data configured</p>
    </div>
  );

  const data = (chart.data ?? []) as Record<string, unknown>[];
  const dataKey = chart.dataKey ?? (data[0] ? Object.keys(data[0]).find((k) => typeof data[0][k] === "number") ?? "value" : "value");
  const xKey = chart.xAxis ?? (data[0] ? Object.keys(data[0])[0] : "label");

  const values = data.map((d) => Number(d[dataKey] ?? 0));
  const max = Math.max(...values, 1);

  const COLORS = ["#ec4899", "#a855f7", "#6366f1", "#f472b6", "#c084fc", "#818cf8", "#fb7185", "#e879f9"];

  if (chart.type === "pie" || chart.type === "donut") {
    const total = values.reduce((a, b) => a + b, 0) || 1;
    let cumulative = 0;
    const segments = data.map((d, i) => {
      const pct = (Number(d[dataKey] ?? 0) / total) * 100;
      const start = cumulative;
      cumulative += pct;
      return { label: String(d[xKey] ?? `Item ${i}`), value: Number(d[dataKey] ?? 0), pct, start, color: COLORS[i % COLORS.length] };
    });

    return (
      <div className="glass rounded-2xl p-6 border border-purple-100">
        {config.title && <h3 className="text-lg font-bold text-indigo-900 mb-4" style={{ fontFamily: "Syne, sans-serif" }}>{config.title}</h3>}
        <div className="flex items-center gap-8">
          <div className="relative w-40 h-40 flex-shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              {segments.map((seg, i) => {
                const r = chart.type === "donut" ? 35 : 45;
                const cx = 50, cy = 50;
                const startAngle = (seg.start / 100) * 2 * Math.PI;
                const endAngle = ((seg.start + seg.pct) / 100) * 2 * Math.PI;
                const x1 = cx + r * Math.cos(startAngle), y1 = cy + r * Math.sin(startAngle);
                const x2 = cx + r * Math.cos(endAngle), y2 = cy + r * Math.sin(endAngle);
                const large = seg.pct > 50 ? 1 : 0;
                const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
                if (chart.type === "donut") {
                  const ir = 22;
                  const ix1 = cx + ir * Math.cos(startAngle), iy1 = cy + ir * Math.sin(startAngle);
                  const ix2 = cx + ir * Math.cos(endAngle), iy2 = cy + ir * Math.sin(endAngle);
                  const dDonut = `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${ir} ${ir} 0 ${large} 0 ${ix1} ${iy1} Z`;
                  return <path key={i} d={dDonut} fill={seg.color} />;
                }
                return <path key={i} d={d} fill={seg.color} />;
              })}
            </svg>
            {chart.type === "donut" && (
              <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-indigo-900">{total}</div>
            )}
          </div>
          <div className="flex flex-col gap-2 flex-1">
            {segments.map((seg, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: seg.color }} />
                <span className="text-xs text-indigo-700 truncate flex-1">{seg.label}</span>
                <span className="text-xs font-bold text-indigo-900">{seg.pct.toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Bar / Line / Area chart
  return (
    <div className="glass rounded-2xl p-6 border border-purple-100">
      {config.title && <h3 className="text-lg font-bold text-indigo-900 mb-4" style={{ fontFamily: "Syne, sans-serif" }}>{config.title}</h3>}
      {data.length === 0 ? (
        <div className="text-center py-8 text-purple-400 text-sm">No chart data</div>
      ) : (
        <div className="relative">
          <div className="flex items-end gap-2 h-40">
            {data.map((d, i) => {
              const val = Number(d[dataKey] ?? 0);
              const h = (val / max) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                  <div className="relative w-full flex items-end justify-center" style={{ height: "120px" }}>
                    <div
                      className="w-full rounded-t-lg transition-all duration-500 group-hover:opacity-80 relative"
                      style={{ height: `${h}%`, background: `linear-gradient(180deg, ${COLORS[i % COLORS.length]}, ${COLORS[(i + 1) % COLORS.length]}80)`, minHeight: "4px" }}
                    >
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-indigo-800 opacity-0 group-hover:opacity-100 whitespace-nowrap">{val}</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-purple-500 truncate w-full text-center">{String(d[xKey] ?? i)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Kanban ────────────────────────────────────────────────────────────────────

export function KanbanRenderer({ config }: { config: ComponentConfig }) {
  const [cols, setCols] = useState<KanbanColumn[]>(config.kanbanColumns ?? []);

  function addItem(colId: string) {
    setCols((prev) =>
      prev.map((c) =>
        c.id === colId
          ? { ...c, items: [...(c.items ?? []), { id: `item_${Date.now()}`, title: "New task" }] }
          : c
      )
    );
  }

  const colColors: Record<string, string> = {
    todo: "from-pink-400 to-rose-400",
    "to do": "from-pink-400 to-rose-400",
    "in progress": "from-purple-400 to-violet-500",
    inprogress: "from-purple-400 to-violet-500",
    done: "from-green-400 to-emerald-500",
    completed: "from-green-400 to-emerald-500",
    review: "from-orange-400 to-amber-500",
  };

  return (
    <div className="space-y-3">
      {config.title && <h3 className="text-lg font-bold text-indigo-900" style={{ fontFamily: "Syne, sans-serif" }}>{config.title}</h3>}
      <div className="flex gap-4 overflow-x-auto pb-2">
        {cols.map((col) => {
          const colorKey = col.title.toLowerCase().replace(/\s+/g, "");
          const gradient = colColors[col.title.toLowerCase()] ?? colColors[colorKey] ?? "from-purple-400 to-pink-400";
          return (
            <div key={col.id} className="flex-shrink-0 w-64">
              <div className={`bg-gradient-to-r ${gradient} rounded-t-xl px-4 py-2.5 flex items-center justify-between`}>
                <span className="text-sm font-bold text-white">{col.title}</span>
                <span className="text-xs bg-white/30 text-white px-1.5 py-0.5 rounded-full">{(col.items ?? []).length}</span>
              </div>
              <div className="bg-white/60 rounded-b-xl border border-t-0 border-purple-100 p-3 space-y-2 min-h-[120px]">
                {(col.items ?? []).map((item) => (
                  <div key={item.id} className="bg-white rounded-xl p-3 shadow-sm border border-purple-50 hover:border-purple-200 transition-all cursor-grab group">
                    <div className="flex items-start gap-2">
                      <GripVertical className="w-3 h-3 text-purple-200 mt-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100" />
                      <div>
                        <p className="text-sm font-medium text-indigo-900">{item.title}</p>
                        {item.description && <p className="text-xs text-purple-400 mt-0.5">{item.description}</p>}
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => addItem(col.id)}
                  className="w-full flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-600 py-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add task
                </button>
              </div>
            </div>
          );
        })}
        {cols.length === 0 && <div className="text-purple-400 text-sm py-8">No kanban columns configured</div>}
      </div>
    </div>
  );
}

// ── Timeline ──────────────────────────────────────────────────────────────────

export function TimelineRenderer({ config }: { config: ComponentConfig }) {
  const events = config.events ?? [];
  const COLORS = ["#ec4899", "#a855f7", "#6366f1", "#f472b6", "#c084fc"];
  return (
    <div className="glass rounded-2xl p-6 border border-purple-100">
      {config.title && <h3 className="text-lg font-bold text-indigo-900 mb-4" style={{ fontFamily: "Syne, sans-serif" }}>{config.title}</h3>}
      <div className="relative pl-6">
        <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-pink-300 to-purple-300" />
        {events.map((ev, i) => (
          <div key={i} className="relative mb-6 last:mb-0">
            <div
              className="absolute -left-4 w-3 h-3 rounded-full border-2 border-white shadow"
              style={{ background: ev.color ?? COLORS[i % COLORS.length] }}
            />
            <div className="bg-white/70 rounded-xl p-4 border border-purple-50 ml-2 hover:border-purple-200 transition-all">
              <div className="flex items-start justify-between mb-1">
                <h4 className="text-sm font-bold text-indigo-900">{ev.title}</h4>
                <div className="flex items-center gap-1 text-xs text-purple-400">
                  <Calendar className="w-3 h-3" />
                  {ev.date}
                </div>
              </div>
              {ev.description && <p className="text-xs text-purple-600">{ev.description}</p>}
            </div>
          </div>
        ))}
        {events.length === 0 && <div className="text-purple-400 text-sm py-4">No events configured</div>}
      </div>
    </div>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────────

export function HeroRenderer({ config }: { config: ComponentConfig }) {
  return (
    <div className="rounded-2xl overflow-hidden relative p-10 text-center animated-gradient border border-purple-100">
      <div className="absolute top-4 right-4 w-24 h-24 rounded-full bg-white/20 blur-xl" />
      <div className="absolute bottom-4 left-4 w-16 h-16 rounded-full bg-pink-300/30 blur-xl" />
      <div className="relative z-10">
        <h2 className="text-4xl font-bold text-indigo-900 mb-4" style={{ fontFamily: "Syne, sans-serif" }}>
          {config.title ?? "Welcome"}
        </h2>
        {config.description && <p className="text-lg text-purple-700 mb-8 max-w-lg mx-auto">{config.description}</p>}
        {config.submitLabel && (
          <button
            className="px-8 py-3 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105"
            style={{ background: "linear-gradient(135deg, #ec4899, #a855f7)" }}
          >
            {config.submitLabel}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────────

export function CardRenderer({ config, children }: { config: ComponentConfig; children?: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl p-6 border border-purple-100 card-hover">
      {config.title && <h3 className="text-lg font-bold text-indigo-900 mb-1" style={{ fontFamily: "Syne, sans-serif" }}>{config.title}</h3>}
      {config.description && <p className="text-sm text-purple-500 mb-4">{config.description}</p>}
      {children}
    </div>
  );
}

// ── List ──────────────────────────────────────────────────────────────────────

export function ListRenderer({ config }: { config: ComponentConfig }) {
  const items = (config.data ?? []) as Record<string, unknown>[];
  return (
    <div className="glass rounded-2xl border border-purple-100 overflow-hidden">
      {config.title && (
        <div className="px-6 py-4 border-b border-purple-50">
          <h3 className="text-lg font-bold text-indigo-900" style={{ fontFamily: "Syne, sans-serif" }}>{config.title}</h3>
        </div>
      )}
      <div className="divide-y divide-purple-50">
        {items.map((item, i) => (
          <div key={i} className="px-6 py-4 flex items-center gap-3 hover:bg-purple-50/40 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center text-sm border border-purple-100">
              {String(item.icon ?? item.emoji ?? (i + 1))}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-indigo-900 truncate">{String(item.title ?? item.name ?? `Item ${i + 1}`)}</p>
              {(item.description != null || item.subtitle != null) && (
                <p className="text-xs text-purple-500 truncate">{String(item.description ?? item.subtitle ?? "")}</p>
              )}
            </div>
            {item.value !== undefined && (
              <span className="text-sm font-bold text-purple-600">{String(item.value)}</span>
            )}
          </div>
        ))}
        {items.length === 0 && <div className="text-center py-8 text-purple-400 text-sm">No items configured</div>}
      </div>
    </div>
  );
}

// ── Gallery ───────────────────────────────────────────────────────────────────

export function GalleryRenderer({ config }: { config: ComponentConfig }) {
  const images = config.images ?? [];
  return (
    <div className="space-y-3">
      {config.title && <h3 className="text-lg font-bold text-indigo-900" style={{ fontFamily: "Syne, sans-serif" }}>{config.title}</h3>}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((img, i) => (
          <div key={i} className="rounded-xl overflow-hidden border border-purple-100 group cursor-pointer card-hover">
            <div className="relative aspect-video bg-gradient-to-br from-pink-100 to-purple-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.src || `https://picsum.photos/400/300?random=${i + 1}`}
                alt={img.alt || `Image ${i + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/400/300?random=${i + 10}`; }}
              />
            </div>
            {img.caption && <p className="px-3 py-2 text-xs text-purple-600">{img.caption}</p>}
          </div>
        ))}
        {images.length === 0 && (
          <div className="col-span-3 text-center py-8 text-purple-400 text-sm">No images configured</div>
        )}
      </div>
    </div>
  );
}
