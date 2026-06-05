import {
  AppConfig,
  ComponentConfig,
  ComponentType,
  FieldConfig,
  FieldType,
  PageConfig,
  SanitizeResult,
} from '@/types';

// ── helpers ──────────────────────────────────────────────────────────────────

function str(v: unknown, fallback = ''): string {
  if (typeof v === 'string') return v;
  if (v != null) return String(v);
  return fallback;
}

function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function arr<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

const VALID_COMPONENT_TYPES: ComponentType[] = [
  'form', 'table', 'dashboard', 'card', 'chart', 'list',
  'hero', 'navbar', 'sidebar', 'modal', 'button', 'input',
  'select', 'textarea', 'stats', 'kanban', 'gallery', 'timeline',
];

const VALID_FIELD_TYPES: FieldType[] = [
  'text', 'email', 'number', 'password', 'select', 'multiselect',
  'textarea', 'checkbox', 'radio', 'date', 'datetime', 'file',
  'color', 'range', 'toggle',
];

let warnBuf: string[] = [];

function warn(msg: string) {
  warnBuf.push(msg);
}

// ── field sanitizer ───────────────────────────────────────────────────────────

function sanitizeField(raw: unknown, idx: number): FieldConfig {
  if (!isObj(raw)) {
    warn(`Field at index ${idx} is not an object — replaced with empty text field`);
    return { id: `field_${idx}`, name: `field_${idx}`, type: 'text' };
  }

  const rawType = str(raw.type).toLowerCase() as FieldType;
  const type: FieldType = VALID_FIELD_TYPES.includes(rawType) ? rawType : 'unknown';
  if (type === 'unknown') warn(`Unknown field type "${raw.type}" — rendered as text input`);

  const options = arr<unknown>(raw.options)
    .map((o, i) => {
      if (isObj(o)) return { label: str(o.label, str(o.value, `Option ${i}`)), value: str(o.value, str(o.label, `opt_${i}`)) };
      if (typeof o === 'string') return { label: o, value: o };
      warn(`Option at index ${i} of field "${raw.name}" is invalid — skipped`);
      return null;
    })
    .filter(Boolean) as { label: string; value: string }[];

  return {
    id: str(raw.id, `field_${idx}`),
    name: str(raw.name, `field_${idx}`),
    label: str(raw.label) || undefined,
    type: type === 'unknown' ? 'text' : type,
    placeholder: str(raw.placeholder) || undefined,
    required: raw.required === true,
    defaultValue: raw.defaultValue,
    options: options.length > 0 ? options : undefined,
  };
}

// ── component sanitizer ───────────────────────────────────────────────────────

function sanitizeComponent(raw: unknown, idx: number): ComponentConfig {
  if (!isObj(raw)) {
    warn(`Component at index ${idx} is not an object — replaced with fallback card`);
    return { id: `comp_${idx}`, type: 'card', title: 'Unknown Component' };
  }

  const rawType = str(raw.type).toLowerCase() as ComponentType;
  const type: ComponentType = VALID_COMPONENT_TYPES.includes(rawType) ? rawType : 'unknown';
  if (type === 'unknown') warn(`Unknown component type "${raw.type}" — rendered as fallback card`);

  const fields = arr<unknown>(raw.fields).map((f, i) => sanitizeField(f, i));

  // columns
  const columns = arr<unknown>(raw.columns).map((c, i): import('@/types').ColumnConfig => {
    if (!isObj(c)) { warn(`Column ${i} invalid`); return { id: `col_${i}`, key: `col_${i}`, label: `Column ${i}`, type: 'text', sortable: false }; }
    const validColTypes = ['text','number','date','badge','boolean','link','unknown'];
    const rawCT = str(c.type, 'text');
    const colType = validColTypes.includes(rawCT) ? rawCT : 'text';
    return { id: str(c.id, `col_${i}`), key: str(c.key, `col_${i}`), label: str(c.label) || undefined, type: colType as import('@/types').ColumnConfig['type'], sortable: c.sortable === true };
  });
  // stats
  const stats = arr<unknown>(raw.stats).map((s, i) => {
    if (!isObj(s)) { warn(`Stat ${i} invalid`); return { label: `Stat ${i}`, value: 0 }; }
    const rawVal = s.value;
    const statValue: string | number = typeof rawVal === 'string' || typeof rawVal === 'number' ? rawVal : String(rawVal ?? 0);
    const trend = (['up','down','neutral'].includes(str(s.trend)) ? str(s.trend) : 'neutral') as 'up'|'down'|'neutral';
    return { label: str(s.label, `Stat ${i}`), value: statValue, change: str(s.change) || undefined, trend, icon: str(s.icon) || undefined };
  });

  // kanban columns
  const kanbanColumns = arr<unknown>(raw.kanbanColumns || raw.columns_kanban).map((c, i) => {
    if (!isObj(c)) return { id: `kcol_${i}`, title: `Column ${i}`, items: [] };
    return {
      id: str(c.id, `kcol_${i}`),
      title: str(c.title, `Column ${i}`),
      color: str(c.color) || undefined,
      items: arr<unknown>(c.items).map((item, j) => {
        if (!isObj(item)) return { id: `item_${j}`, title: `Item ${j}` };
        return { id: str(item.id, `item_${j}`), title: str(item.title, `Item ${j}`), description: str(item.description) || undefined };
      }),
    };
  });

  // chart
  let chart = undefined;
  if (isObj(raw.chart)) {
    const c = raw.chart;
    const validChartTypes = ['bar','line','pie','donut','area','unknown'];
    const rawChartType = str(c.type, 'bar');
    const chartType = validChartTypes.includes(rawChartType) ? rawChartType : 'bar';
    chart = { type: chartType as import('@/types').ChartConfig['type'], dataKey: str(c.dataKey) || undefined, xAxis: str(c.xAxis) || undefined, yAxis: str(c.yAxis) || undefined, data: arr(c.data) };
  }

  // children recursively
  const children = arr<unknown>(raw.children).map((c, i) => sanitizeComponent(c, i));

  // data rows
  const data = arr<unknown>(raw.data).map((row) => (isObj(row) ? row : { value: row }));

  return {
    id: str(raw.id, `comp_${idx}`),
    type,
    title: str(raw.title) || undefined,
    description: str(raw.description) || undefined,
    fields: fields.length > 0 ? fields : undefined,
    submitLabel: str(raw.submitLabel) || undefined,
    columns: columns.length > 0 ? columns : undefined,
    data: data.length > 0 ? data : undefined,
    chart,
    stats: stats.length > 0 ? stats : undefined,
    kanbanColumns: kanbanColumns.length > 0 ? kanbanColumns : undefined,
    children: children.length > 0 ? children : undefined,
    layout: (['grid','flex','stack','unknown'].includes(str(raw.layout)) ? str(raw.layout) : undefined) as 'grid'|'flex'|'stack'|'unknown'|undefined,
    cols: typeof raw.cols === 'number' ? raw.cols : undefined,
  };
}

// ── page sanitizer ────────────────────────────────────────────────────────────

function sanitizePage(raw: unknown, idx: number): PageConfig {
  if (!isObj(raw)) {
    warn(`Page at index ${idx} is not an object — replaced with empty page`);
    return { id: `page_${idx}`, name: `Page ${idx + 1}`, components: [] };
  }

  const components = arr<unknown>(raw.components).map((c, i) => sanitizeComponent(c, i));
  if (components.length === 0) warn(`Page "${raw.name}" has no components`);

  return {
    id: str(raw.id, `page_${idx}`),
    name: str(raw.name, `Page ${idx + 1}`),
    path: str(raw.path) || undefined,
    icon: str(raw.icon) || undefined,
    components,
  };
}

// ── main sanitizer ────────────────────────────────────────────────────────────

export function sanitizeConfig(raw: unknown): SanitizeResult {
  warnBuf = [];

  if (!isObj(raw)) {
    warn('Top-level config is not an object — returning minimal fallback');
    return {
      config: { name: 'Generated App', pages: [{ id: 'page_0', name: 'Home', components: [] }] },
      warnings: warnBuf,
    };
  }

  const pages = arr<unknown>(raw.pages).map((p, i) => sanitizePage(p, i));
  if (pages.length === 0) {
    warn('No pages defined — creating default page');
    pages.push({ id: 'page_0', name: 'Home', components: [] });
  }

  const config: AppConfig = {
    name: str(raw.name, 'Generated App'),
    description: str(raw.description) || undefined,
    theme: isObj(raw.theme)
      ? {
          primaryColor: str(raw.theme.primaryColor) || undefined,
          accentColor: str(raw.theme.accentColor) || undefined,
          fontFamily: str(raw.theme.fontFamily) || undefined,
        }
      : undefined,
    pages,
    navigation: arr<unknown>(raw.navigation).map((n, i) => {
      if (!isObj(n)) return { label: `Nav ${i}`, path: '/' };
      return { label: str(n.label, `Nav ${i}`), path: str(n.path, '/'), icon: str(n.icon) || undefined };
    }),
  };

  return { config, warnings: warnBuf };
}
