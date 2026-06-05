import { NextRequest, NextResponse } from 'next/server';
import { generateAppConfig } from '@/lib/groq';
import { createApp } from '@/lib/db';
import { GeneratedApp } from '@/types';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt } = body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 3) {
      return NextResponse.json({ success: false, error: 'Prompt is required (min 3 characters)' }, { status: 400 });
    }

    const { config, warnings, rawResponse } = await generateAppConfig(prompt.trim());

    const now = new Date().toISOString();
    const id = `app_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const app: GeneratedApp = {
      id,
      name: config.name,
      description: config.description,
      prompt: prompt.trim(),
      config,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };

    createApp(app);

    return NextResponse.json({ success: true, app, warnings, rawResponse });
  } catch (err: unknown) {
    console.error('[generate] error:', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
