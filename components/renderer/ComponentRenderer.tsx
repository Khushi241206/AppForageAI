"use client";

import { ComponentConfig } from "@/types";
import { FormRenderer } from "./FormRenderer";
import { TableRenderer } from "./TableRenderer";
import {
  StatsRenderer,
  ChartRenderer,
  KanbanRenderer,
  TimelineRenderer,
  HeroRenderer,
  CardRenderer,
  ListRenderer,
  GalleryRenderer,
} from "./WidgetRenderers";
import { AlertTriangle } from "lucide-react";

function FallbackRenderer({ config }: { config: ComponentConfig }) {
  return (
    <div className="glass rounded-2xl p-6 border border-pink-200 bg-pink-50/30">
      <div className="flex items-center gap-2 text-pink-600 mb-2">
        <AlertTriangle className="w-4 h-4" />
        <span className="text-sm font-semibold">Unknown component type: {String(config.type)}</span>
      </div>
      {config.title && <p className="text-sm text-purple-600">{config.title}</p>}
      {config.description && <p className="text-xs text-purple-400 mt-1">{config.description}</p>}
      <details className="mt-3">
        <summary className="text-xs text-purple-400 cursor-pointer hover:text-purple-600">View raw config</summary>
        <pre className="text-xs text-purple-500 mt-2 overflow-auto max-h-40 bg-white/60 rounded-lg p-2 border border-purple-100">
          {JSON.stringify(config, null, 2)}
        </pre>
      </details>
    </div>
  );
}

interface ComponentRendererProps {
  config: ComponentConfig;
}

export function ComponentRenderer({ config }: ComponentRendererProps) {
  if (!config || typeof config !== "object") {
    return (
      <div className="glass rounded-xl p-4 border border-pink-200 text-pink-600 text-sm">
        Invalid component configuration
      </div>
    );
  }

  // Wrap in error boundary logic
  try {
    switch (config.type) {
      case "form":
        return <FormRenderer config={config} />;

      case "table":
        return <TableRenderer config={config} />;

      case "stats":
        return <StatsRenderer config={config} />;

      case "chart":
        return <ChartRenderer config={config} />;

      case "kanban":
        return <KanbanRenderer config={config} />;

      case "timeline":
        return <TimelineRenderer config={config} />;

      case "hero":
        return <HeroRenderer config={config} />;

      case "card":
        return (
          <CardRenderer config={config}>
            {config.children?.map((child, i) => (
              <ComponentRenderer key={child.id || i} config={child} />
            ))}
          </CardRenderer>
        );

      case "list":
        return <ListRenderer config={config} />;

      case "gallery":
        return <GalleryRenderer config={config} />;

      case "dashboard":
        // Dashboard is a layout container
        return (
          <div className="space-y-6">
            {config.title && (
              <h2 className="text-2xl font-bold text-indigo-900" style={{ fontFamily: "Syne, sans-serif" }}>
                {config.title}
              </h2>
            )}
            {config.stats && <StatsRenderer config={config} />}
            <div className={`grid gap-6 ${config.cols === 2 ? "grid-cols-1 md:grid-cols-2" : config.cols === 3 ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1"}`}>
              {config.children?.map((child, i) => (
                <ComponentRenderer key={child.id || i} config={child} />
              ))}
            </div>
          </div>
        );

      case "navbar":
      case "sidebar":
      case "modal":
      case "button":
      case "input":
      case "select":
      case "textarea":
        // These are inline elements - render as cards
        return (
          <div className="glass rounded-2xl p-6 border border-purple-100">
            {config.title && <h3 className="text-lg font-bold text-indigo-900 mb-2" style={{ fontFamily: "Syne, sans-serif" }}>{config.title}</h3>}
            {config.description && <p className="text-sm text-purple-500">{config.description}</p>}
            {config.children?.map((child, i) => (
              <ComponentRenderer key={child.id || i} config={child} />
            ))}
          </div>
        );

      case "unknown":
      default:
        return <FallbackRenderer config={config} />;
    }
  } catch (err) {
    console.error("ComponentRenderer error:", err);
    return (
      <div className="glass rounded-xl p-4 border border-pink-200 bg-pink-50/30 text-sm">
        <div className="flex items-center gap-2 text-pink-600">
          <AlertTriangle className="w-4 h-4" />
          <span className="font-medium">Component render error</span>
        </div>
        <p className="text-purple-500 mt-1 text-xs">{err instanceof Error ? err.message : "Unknown error"}</p>
      </div>
    );
  }
}
