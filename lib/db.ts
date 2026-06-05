import fs from 'fs';
import path from 'path';
import { GeneratedApp } from '@/types';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

interface DbSchema {
  apps: GeneratedApp[];
}

function ensureDb(): DbSchema {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    const initial: DbSchema = { apps: [] };
    fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2));
    return initial;
  }
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(raw) as DbSchema;
  } catch {
    const initial: DbSchema = { apps: [] };
    fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2));
    return initial;
  }
}

function writeDb(data: DbSchema): void {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

export function getAllApps(): GeneratedApp[] {
  const db = ensureDb();
  return db.apps.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getAppById(id: string): GeneratedApp | null {
  const db = ensureDb();
  return db.apps.find((a) => a.id === id) ?? null;
}

export function createApp(app: GeneratedApp): GeneratedApp {
  const db = ensureDb();
  db.apps.push(app);
  writeDb(db);
  return app;
}

export function updateApp(id: string, updates: Partial<GeneratedApp>): GeneratedApp | null {
  const db = ensureDb();
  const idx = db.apps.findIndex((a) => a.id === id);
  if (idx === -1) return null;
  db.apps[idx] = { ...db.apps[idx], ...updates, updatedAt: new Date().toISOString() };
  writeDb(db);
  return db.apps[idx];
}

export function deleteApp(id: string): boolean {
  const db = ensureDb();
  const before = db.apps.length;
  db.apps = db.apps.filter((a) => a.id !== id);
  writeDb(db);
  return db.apps.length < before;
}
