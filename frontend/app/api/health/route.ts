import { NextResponse } from 'next/server';
export async function GET() {
  return NextResponse.json({ status: 'ok', service: 'safesheet-ai-frontend', timestamp: new Date().toISOString() });
}
