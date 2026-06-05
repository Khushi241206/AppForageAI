// ============================================================
// Core Types for AI App Generator
// ============================================================

export type ComponentType =
  | 'form'
  | 'table'
  | 'dashboard'
  | 'card'
  | 'chart'
  | 'list'
  | 'hero'
  | 'navbar'
  | 'sidebar'
  | 'modal'
  | 'button'
  | 'input'
  | 'select'
  | 'textarea'
  | 'stats'
  | 'kanban'
  | 'gallery'
  | 'timeline'
  | 'unknown';

export type FieldType =
  | 'text'
  | 'email'
  | 'number'
  | 'password'
  | 'select'
  | 'multiselect'
  | 'textarea'
  | 'checkbox'
  | 'radio'
  | 'date'
  | 'datetime'
  | 'file'
  | 'color'
  | 'range'
  | 'toggle'
  | 'unknown';

export interface FieldConfig {
  id: string;
  name: string;
  label?: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  defaultValue?: unknown;
  options?: Array<{ label: string; value: string }>;
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
  [key: string]: unknown; // allow extra unknown fields
}

export interface ColumnConfig {
  id: string;
  key: string;
  label?: string;
  type?: 'text' | 'number' | 'date' | 'badge' | 'boolean' | 'link' | 'unknown';
  sortable?: boolean;
  filterable?: boolean;
  [key: string]: unknown;
}

export interface ChartConfig {
  type: 'bar' | 'line' | 'pie' | 'donut' | 'area' | 'unknown';
  dataKey?: string;
  xAxis?: string;
  yAxis?: string;
  data?: unknown[];
  [key: string]: unknown;
}

export interface StatConfig {
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: string;
  color?: string;
}

export interface KanbanColumn {
  id: string;
  title: string;
  color?: string;
  items?: Array<{ id: string; title: string; description?: string; [key: string]: unknown }>;
}

export interface ComponentConfig {
  id: string;
  type: ComponentType;
  title?: string;
  description?: string;
  // form-specific
  fields?: FieldConfig[];
  submitLabel?: string;
  // table-specific
  columns?: ColumnConfig[];
  data?: unknown[];
  pagination?: boolean;
  searchable?: boolean;
  // chart-specific
  chart?: ChartConfig;
  // stats-specific
  stats?: StatConfig[];
  // kanban-specific
  kanbanColumns?: KanbanColumn[];
  // gallery-specific
  images?: Array<{ src: string; alt?: string; caption?: string }>;
  // timeline-specific
  events?: Array<{ date: string; title: string; description?: string; color?: string }>;
  // generic children
  children?: ComponentConfig[];
  // layout
  layout?: 'grid' | 'flex' | 'stack' | 'unknown';
  cols?: number;
  // style overrides
  style?: Record<string, string>;
  className?: string;
  // any extra unknown config
  [key: string]: unknown;
}

export interface PageConfig {
  id: string;
  name: string;
  path?: string;
  icon?: string;
  components: ComponentConfig[];
  [key: string]: unknown;
}

export interface AppConfig {
  name: string;
  description?: string;
  theme?: {
    primaryColor?: string;
    accentColor?: string;
    fontFamily?: string;
  };
  pages: PageConfig[];
  navigation?: Array<{
    label: string;
    path: string;
    icon?: string;
  }>;
  [key: string]: unknown;
}

export interface GeneratedApp {
  id: string;
  name: string;
  description?: string;
  prompt: string;
  config: AppConfig;
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface GenerateRequest {
  prompt: string;
}

export interface GenerateResponse {
  success: boolean;
  app?: GeneratedApp;
  error?: string;
}

// Sanitization result with warnings
export interface SanitizeResult {
  config: AppConfig;
  warnings: string[];
}
