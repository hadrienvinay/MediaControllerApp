import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const OUTPUT_DIR = path.join(process.cwd(), 'public', 'converted');

type ElementData = {
  kind: 'text' | 'image' | 'signature';
  page: number;
  x: number;      // 0-1 fraction of page width
  y: number;      // 0-1 fraction of page height (top = 0)
  text?: string;
  fontSize?: number;  // pt
  color?: string;     // #rrggbb
  dataUrl?: string;
  width?: number;     // 0-1 fraction of page width
};

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  const operation = (formData.get('operation') as string) ?? 'info';

  if (!file) return NextResponse.json({ error: 'Fichier PDF manquant' }, { status: 400 });
  if (!file.name.toLowerCase().endsWith('.pdf')) {
    return NextResponse.json({ error: 'Le fichier doit être un PDF.' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // ── Info: return page count + dimensions ───────────────────────────────────
  if (operation === 'info') {
    try {
      const doc = await PDFDocument.load(buffer);
      const dimensions = doc.getPages().map(p => p.getSize());
      return NextResponse.json({ pageCount: dimensions.length, dimensions });
    } catch {
      return NextResponse.json({ error: 'PDF invalide ou protégé.' }, { status: 400 });
    }
  }

  // ── Fill: apply elements to the PDF ───────────────────────────────────────
  if (operation === 'fill') {
    let elements: ElementData[] = [];
    try {
      elements = JSON.parse(formData.get('elements') as string);
    } catch {
      return NextResponse.json({ error: 'Données d\'éléments invalides.' }, { status: 400 });
    }

    try {
      const doc = await PDFDocument.load(buffer);
      const font = await doc.embedFont(StandardFonts.Helvetica);

      for (const el of elements) {
        const pageIndex = el.page - 1;
        if (pageIndex < 0 || pageIndex >= doc.getPageCount()) continue;
        const page = doc.getPage(pageIndex);
        const { width: pw, height: ph } = page.getSize();

        if (el.kind === 'text' && el.text?.trim()) {
          const size = Math.max(4, el.fontSize ?? 12);
          const hex = (el.color ?? '#000000').replace('#', '');
          const r = parseInt(hex.slice(0, 2), 16) / 255;
          const g = parseInt(hex.slice(2, 4), 16) / 255;
          const b = parseInt(hex.slice(4, 6), 16) / 255;

          // Split multiline text
          const lines = el.text.split('\n');
          const lineHeight = size * 1.2;
          lines.forEach((line, i) => {
            page.drawText(line, {
              x: el.x * pw,
              y: ph - el.y * ph - size - i * lineHeight,
              size,
              font,
              color: rgb(Math.min(1, r), Math.min(1, g), Math.min(1, b)),
            });
          });
        } else if ((el.kind === 'image' || el.kind === 'signature') && el.dataUrl) {
          const base64 = el.dataUrl.split(',')[1];
          if (!base64) continue;
          const imgBuf = Buffer.from(base64, 'base64');
          const isPng = el.dataUrl.includes('image/png');

          let embedded;
          try {
            embedded = isPng ? await doc.embedPng(imgBuf) : await doc.embedJpg(imgBuf);
          } catch { continue; }

          const imgW = (el.width ?? 0.25) * pw;
          const imgH = imgW * (embedded.height / embedded.width);
          page.drawImage(embedded, {
            x: el.x * pw,
            y: ph - el.y * ph - imgH,
            width: imgW,
            height: imgH,
          });
        }
      }

      const pdfBytes = await doc.save();
      await fs.mkdir(OUTPUT_DIR, { recursive: true });
      const filename = `${uuidv4()}.pdf`;
      await fs.writeFile(path.join(OUTPUT_DIR, filename), pdfBytes);

      return NextResponse.json({
        url: `/converted/${filename}`,
        originalName: `${file.name.replace(/\.pdf$/i, '')}_rempli.pdf`,
      });
    } catch {
      return NextResponse.json({ error: 'Erreur lors du remplissage du PDF.' }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'Opération non reconnue.' }, { status: 400 });
}
