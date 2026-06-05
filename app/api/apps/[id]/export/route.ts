import { NextRequest, NextResponse } from "next/server";
import { getAppById } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const app = getAppById(id);
  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const json = JSON.stringify(app.config, null, 2);
  return new NextResponse(json, {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${app.name.replace(/\s+/g, "-").toLowerCase()}-config.json"`,
    },
  });
}
