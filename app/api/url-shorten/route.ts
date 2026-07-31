import { NextRequest, NextResponse } from 'next/server';
import { createShortUrl, getAllShortUrls, deleteShortUrl } from '@/lib/url-storage';

export async function GET() {
  const urls = await getAllShortUrls();
  return NextResponse.json(urls);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { url } = body;

  if (!url?.trim()) return NextResponse.json({ error: 'URL manquante' }, { status: 400 });

  try { new URL(url); } catch {
    return NextResponse.json({ error: 'URL invalide' }, { status: 400 });
  }

  const entry = await createShortUrl(url);
  const baseUrl = new URL(request.url).origin;
  return NextResponse.json({ ...entry, shortUrl: `${baseUrl}/r/${entry.code}` });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  if (!code) return NextResponse.json({ error: 'Code manquant' }, { status: 400 });
  const deleted = await deleteShortUrl(code);
  return NextResponse.json({ deleted });
}
