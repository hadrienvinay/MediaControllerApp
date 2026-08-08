import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse');

const OUTPUT_DIR = path.join(process.cwd(), 'public', 'converted');

/** Parse a page selection string like "1, 3-5, 8" into sorted unique 1-indexed page numbers */
function parsePageSelection(input: string, totalPages: number): number[] {
  const pages = new Set<number>();
  for (const part of input.split(',')) {
    const trimmed = part.trim();
    const range = trimmed.match(/^(\d+)\s*-\s*(\d+)$/);
    if (range) {
      const from = parseInt(range[1]);
      const to = parseInt(range[2]);
      for (let i = Math.max(1, from); i <= Math.min(totalPages, to); i++) pages.add(i);
    } else {
      const n = parseInt(trimmed);
      if (!isNaN(n) && n >= 1 && n <= totalPages) pages.add(n);
    }
  }
  return [...pages].sort((a, b) => a - b);
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  const operation = formData.get('operation') as string;

  if (!file) return NextResponse.json({ error: 'Fichier PDF manquant' }, { status: 400 });
  if (!file.name.toLowerCase().endsWith('.pdf')) {
    return NextResponse.json({ error: 'Le fichier doit être un PDF.' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // ── Count pages only ──────────────────────────────────────────────────────
  if (operation === 'count') {
    try {
      const data = await pdfParse(buffer);
      return NextResponse.json({ pageCount: data.numpages });
    } catch {
      return NextResponse.json({ error: 'Impossible de lire ce PDF.' }, { status: 400 });
    }
  }

  // ── Extract selected pages ────────────────────────────────────────────────
  if (operation === 'extract') {
    const pagesParam = formData.get('pages') as string;
    if (!pagesParam) return NextResponse.json({ error: 'Sélection de pages manquante.' }, { status: 400 });

    let selectedPages: number[];
    try {
      // Accept either JSON array "[1,3,5]" or text "1, 3-5, 8"
      selectedPages = pagesParam.startsWith('[')
        ? (JSON.parse(pagesParam) as number[])
        : parsePageSelection(pagesParam, 9999);
    } catch {
      return NextResponse.json({ error: 'Format de sélection invalide.' }, { status: 400 });
    }

    if (selectedPages.length === 0) {
      return NextResponse.json({ error: 'Aucune page sélectionnée.' }, { status: 400 });
    }

    try {
      const srcDoc = await PDFDocument.load(buffer);
      const totalPages = srcDoc.getPageCount();

      const validPages = selectedPages.filter(p => p >= 1 && p <= totalPages);
      if (validPages.length === 0) {
        return NextResponse.json({ error: `Ce PDF n'a que ${totalPages} page(s).` }, { status: 400 });
      }

      const newDoc = await PDFDocument.create();
      const indices = validPages.map(p => p - 1); // 0-indexed
      const copied = await newDoc.copyPages(srcDoc, indices);
      copied.forEach(page => newDoc.addPage(page));

      const pdfBytes = await newDoc.save();
      await fs.mkdir(OUTPUT_DIR, { recursive: true });

      const filename = `${uuidv4()}.pdf`;
      await fs.writeFile(path.join(OUTPUT_DIR, filename), pdfBytes);

      const baseName = file.name.replace(/\.pdf$/i, '');
      return NextResponse.json({
        url: `/converted/${filename}`,
        filename,
        originalName: `${baseName}_pages_${validPages.join('-')}.pdf`,
        pageCount: validPages.length,
      });
    } catch {
      return NextResponse.json({ error: 'Erreur lors de l\'extraction des pages.' }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'Opération non reconnue.' }, { status: 400 });
}
