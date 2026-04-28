import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'Fichier PDF requis' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    // Lazy import keeps mupdf WASM out of the build-time module graph
    const { pdfToImages } = await import('@/lib/file-converter');
    const images = await pdfToImages(buffer);
    const pages = images.map(img => `data:image/png;base64,${img.toString('base64')}`);

    return NextResponse.json({ pages, count: pages.length });
  } catch {
    return NextResponse.json({ error: 'Erreur lors du rendu PDF' }, { status: 500 });
  }
}
