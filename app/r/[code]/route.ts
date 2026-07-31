import { NextRequest, NextResponse } from 'next/server';
import { resolveShortUrl } from '@/lib/url-storage';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const entry = await resolveShortUrl(code);
  if (!entry) {
    return NextResponse.json({ error: 'URL introuvable' }, { status: 404 });
  }
  return NextResponse.redirect(entry.url);
}
