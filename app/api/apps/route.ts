import { NextResponse } from 'next/server';
import { getAllApps } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const apps = getAllApps();
    return NextResponse.json({ success: true, apps });
  } catch (err) {
    console.error('[apps/GET]', err);
    return NextResponse.json({ success: false, error: 'Failed to fetch apps' }, { status: 500 });
  }
}
