"use client";

import { useState, useMemo } from "react";
import { ComponentConfig, ColumnConfig } from "@/types";
import { Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 8;

function BadgeCell({ value }: { value: unknown }) {
  const str = String(value ?? "");
  const colors: Record<string, string> = {
    active: "bg-green-50 text-green-700 border-green-100",
    inactive: "bg-red-50 text-red-600 border-red-100",
    pending: "bg-yellow-50 text-yellow-700 border-yellow-100",
    completed: "bg-blue-50 text-blue-700 border-blue-100",
    approved: "bg-purple-50 text-purple-700 border-purple-100",
    rejected: "bg-red-50 text-red-600 border-red-100",
    draft: "bg-gray-50 text-gray-600 border-gray-100",
    open: "bg-pink-50 text-pink-700 border-pink-100",
    closed: "bg-gray-50 text-gray-500 border-gray-100",
  };
  const cls = colors[str.toLowerCase()] ?? "bg-purple-50 text-purple-700 border-purple-100";
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${cls}`}>
      {str}
    </span>
  );
}

function CellValue({ col, value }: { col: ColumnConfig; value: unknown }) {
  if (value === null || value === undefined) return <span className="text-purple-300 italic text-xs">—</span>;
  if (col.type === "badge") return <BadgeCell value={value} />;
  if (col.type === "boolean") return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${value ? "bg-green-50 text-green-700 border-green-100" : "bg-red-50 text-red-600 border-red-100"}`}>
      {value ? "Yes" : "No"}
    </span>
  );
  if (col.type === "date") {
    try { return <span className="text-sm text-indigo-700">{new Date(String(value)).toLocaleDateString()}</span>; }
    catch { return <span className="text-sm text-indigo-700">{String(value)}</span>; }
  }
  if (col.type === "link") return <a href={String(value)} className="text-pink-500 hover:text-purple-600 underline text-sm truncate max-w-[150px] block" target="_blank" rel="noreferrer">{String(value)}</a>;
  return <span className="text-sm text-indigo-800 truncate max-w-[200px] block">{String(value)}</span>;
}

export function TableRenderer({ config }: { config: ComponentConfig }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const columns = config.columns ?? [];
  const rawData = (config.data ?? []) as Record<string, unknown>[];

  const filtered = useMemo(() => {
    if (!search) return rawData;
    return rawData.filter((row) =>
      Object.values(row).some((v) =>
        String(v ?? "").toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [rawData, search]);

  const sorted = useMemo(() => {
    if (!sortCol) return filtered;
    return [...filtered].sort((a, b) => {
      const av = a[sortCol], bv = b[sortCol];
      const cmp = String(av ?? "").localeCompare(String(bv ?? ""), undefined, { numeric: true });
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortCol, sortDir]);

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paginated = config.pagination !== false ? sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE) : sorted;

  function toggleSort(key: string) {
    if (sortCol === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortCol(key);
      setSortDir("asc");
    }
    setPage(0);
  }

  return (
    <div className="glass rounded-2xl border border-purple-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-purple-50 flex items-center justify-between">
        <div>
          {config.title && <h3 className="text-lg font-bold text-indigo-900" style={{ fontFamily: "Syne, sans-serif" }}>{config.title}</h3>}
          {config.description && <p className="text-xs text-purple-400 mt-0.5">{config.description}</p>}
        </div>
        {config.searchable !== false && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-purple-100 bg-white/60 text-sm">
            <Search className="w-3.5 h-3.5 text-purple-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              placeholder="Search..."
              className="bg-transparent text-sm text-indigo-800 placeholder-purple-300 focus:outline-none w-40"
            />
          </div>
        )}
      </div>

      {columns.length === 0 ? (
        <div className="text-center py-10 text-purple-400 text-sm">No columns configured</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-purple-50/50">
                  {columns.map((col) => (
                    <th
                      key={col.id}
                      onClick={() => col.sortable && toggleSort(col.key)}
                      className={`px-4 py-3 text-left text-xs font-bold text-purple-700 uppercase tracking-wide whitespace-nowrap ${col.sortable ? "cursor-pointer hover:text-pink-600" : ""}`}
                    >
                      <span className="flex items-center gap-1">
                        {col.label ?? col.key}
                        {col.sortable && sortCol === col.key && (
                          sortDir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                        )}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="text-center py-10 text-purple-400 text-sm">
                      No data found
                    </td>
                  </tr>
                ) : (
                  paginated.map((row, ri) => (
                    <tr key={ri} className="border-t border-purple-50 hover:bg-purple-50/40 transition-colors">
                      {columns.map((col) => (
                        <td key={col.id} className="px-4 py-3">
                          <CellValue col={col} value={row[col.key]} />
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {config.pagination !== false && totalPages > 1 && (
            <div className="px-6 py-3 border-t border-purple-50 flex items-center justify-between text-sm text-purple-600">
              <span>{filtered.length} records</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="p-1.5 rounded-lg hover:bg-purple-50 disabled:opacity-40 transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs">{page + 1} / {totalPages}</span>
                <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="p-1.5 rounded-lg hover:bg-purple-50 disabled:opacity-40 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
