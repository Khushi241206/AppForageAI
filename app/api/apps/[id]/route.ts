import { NextRequest, NextResponse } from 'next/server';
import { getAppById, updateApp, deleteApp } from '@/lib/db';
import { regenerateComponent } from '@/lib/groq';

export const runtime = 'nodejs';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const app = getAppById(id);
    if (!app) return NextResponse.json({ success: false, error: 'App not found' }, { status: 404 });
    return NextResponse.json({ success: true, app });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Failed to fetch app' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { action, componentId, instructions, config, name } = body;

    const existing = getAppById(id);
    if (!existing) return NextResponse.json({ success: false, error: 'App not found' }, { status: 404 });

    if (action === 'regenerate-component' && componentId && instructions) {
      const newConfig = await regenerateComponent(existing.config, componentId, instructions);
      const updated = updateApp(id, { config: newConfig });
      return NextResponse.json({ success: true, app: updated });
    }

    if (action === 'update-config' && config) {
      const updated = updateApp(id, { config });
      return NextResponse.json({ success: true, app: updated });
    }

    if (name) {
      const updated = updateApp(id, { name });
      return NextResponse.json({ success: true, app: updated });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Update failed';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const deleted = deleteApp(id);
    if (!deleted) return NextResponse.json({ success: false, error: 'App not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Delete failed' }, { status: 500 });
  }
}
