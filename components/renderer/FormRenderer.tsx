"use client";

import { useState } from "react";
import { ComponentConfig, FieldConfig } from "@/types";
import { Send, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

function RenderField({ field }: { field: FieldConfig }) {
  const [showPwd, setShowPwd] = useState(false);
  const base =
    "w-full px-3 py-2 rounded-xl border border-purple-100 bg-white/60 text-sm text-indigo-900 placeholder-purple-300 transition-all focus:border-purple-400 focus:ring-2 focus:ring-purple-100";

  const label = field.label || field.name;

  if (field.type === "select" || field.type === "multiselect") {
    return (
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-purple-700 uppercase tracking-wide">
          {label} {field.required && <span className="text-pink-500">*</span>}
        </label>
        <select multiple={field.type === "multiselect"} className={base}>
          <option value="">Select {label}</option>
          {(field.options ?? []).map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    );
  }

  if (field.type === "textarea") {
    return (
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-purple-700 uppercase tracking-wide">
          {label} {field.required && <span className="text-pink-500">*</span>}
        </label>
        <textarea
          placeholder={field.placeholder || `Enter ${label}...`}
          rows={3}
          className={base + " resize-none"}
        />
      </div>
    );
  }

  if (field.type === "checkbox") {
    return (
      <label className="flex items-center gap-3 cursor-pointer group">
        <input type="checkbox" className="w-4 h-4 accent-purple-500 rounded" />
        <span className="text-sm text-indigo-800 group-hover:text-purple-700">{label}</span>
      </label>
    );
  }

  if (field.type === "toggle") {
    return (
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-indigo-800">{label}</span>
        <ToggleSwitch />
      </div>
    );
  }

  if (field.type === "radio") {
    return (
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-purple-700 uppercase tracking-wide">
          {label} {field.required && <span className="text-pink-500">*</span>}
        </label>
        <div className="flex flex-wrap gap-3">
          {(field.options ?? []).map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name={field.name} value={opt.value} className="accent-purple-500" />
              <span className="text-sm text-indigo-800">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>
    );
  }

  if (field.type === "range") {
    return (
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-purple-700 uppercase tracking-wide">{label}</label>
        <input type="range" min={field.validation?.min ?? 0} max={field.validation?.max ?? 100} className="w-full accent-purple-500" />
      </div>
    );
  }

  // default input
  const inputType =
    field.type === "password" ? (showPwd ? "text" : "password") :
    field.type === "email" ? "email" :
    field.type === "number" ? "number" :
    field.type === "date" ? "date" :
    field.type === "datetime" ? "datetime-local" :
    field.type === "color" ? "color" :
    field.type === "file" ? "file" : "text";

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-purple-700 uppercase tracking-wide">
        {label} {field.required && <span className="text-pink-500">*</span>}
      </label>
      <div className="relative">
        <input
          type={inputType}
          placeholder={field.placeholder || `Enter ${label}...`}
          className={base + (field.type === "password" ? " pr-10" : "")}
        />
        {field.type === "password" && (
          <button
            type="button"
            onClick={() => setShowPwd(!showPwd)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 hover:text-purple-600"
          >
            {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  );
}

function ToggleSwitch() {
  const [on, setOn] = useState(false);
  return (
    <button
      onClick={() => setOn(!on)}
      className={`relative w-10 h-6 rounded-full transition-all ${on ? "bg-purple-500" : "bg-purple-100"}`}
    >
      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${on ? "left-5" : "left-1"}`} />
    </button>
  );
}

export function FormRenderer({ config }: { config: ComponentConfig }) {
  const fields = config.fields ?? [];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    toast.success("Form submitted! (demo)");
  }

  return (
    <div className="glass rounded-2xl p-6 border border-purple-100">
      {config.title && (
        <h3 className="text-lg font-bold text-indigo-900 mb-1" style={{ fontFamily: "Syne, sans-serif" }}>
          {config.title}
        </h3>
      )}
      {config.description && (
        <p className="text-sm text-purple-500 mb-6">{config.description}</p>
      )}
      {fields.length === 0 ? (
        <div className="text-center py-8 text-purple-400 text-sm">No fields configured</div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {fields.map((field) => (
              <div key={field.id} className={field.type === "textarea" ? "md:col-span-2" : ""}>
                <RenderField field={field} />
              </div>
            ))}
          </div>
          <div className="pt-2">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg, #ec4899, #a855f7)" }}
            >
              <Send className="w-4 h-4" />
              {config.submitLabel || "Submit"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
