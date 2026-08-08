import { NextRequest, NextResponse } from 'next/server';
import sharp, { FitEnum } from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const OUTPUT_DIR = path.join(process.cwd(), 'public', 'converted');

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'Image manquante.' }, { status: 400 });

  const widthRaw = formData.get('width') as string | null;
  const heightRaw = formData.get('height') as string | null;
  const fit = (formData.get('fit') as keyof FitEnum) || 'inside';
  const format = (formData.get('format') as 'jpeg' | 'png' | 'webp') || 'jpeg';
  const quality = Math.min(100, Math.max(10, parseInt((formData.get('quality') as string) || '85')));

  const w = widthRaw ? parseInt(widthRaw) : undefined;
  const h = heightRaw ? parseInt(heightRaw) : undefined;
  if (!w && !h) return NextResponse.json({ error: 'Précisez au moins une dimension.' }, { status: 400 });

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    let pipeline = sharp(buffer).resize(w, h, { fit, withoutEnlargement: false });

    if (format === 'jpeg') pipeline = pipeline.jpeg({ quality });
    else if (format === 'png') pipeline = pipeline.png({ compressionLevel: 9 });
    else if (format === 'webp') pipeline = pipeline.webp({ quality });

    const output = await pipeline.toBuffer();
    await fs.mkdir(OUTPUT_DIR, { recursive: true });

    const ext = format === 'jpeg' ? 'jpg' : format;
    const filename = `${uuidv4()}.${ext}`;
    await fs.writeFile(path.join(OUTPUT_DIR, filename), output);

    const baseName = file.name.replace(/\.[^.]+$/, '');
    const dim = w && h ? `${w}x${h}` : w ? `w${w}` : `h${h}`;
    return NextResponse.json({
      url: `/converted/${filename}`,
      name: `${baseName}_${dim}.${ext}`,
    });
  } catch {
    return NextResponse.json({ error: 'Erreur lors du redimensionnement.' }, { status: 500 });
  }
}
