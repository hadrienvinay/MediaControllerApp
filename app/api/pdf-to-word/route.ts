import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Document, Packer, Paragraph, HeadingLevel } from 'docx';
import * as XLSX from 'xlsx';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse');

const OUTPUT_DIR = path.join(process.cwd(), 'public', 'converted');

async function extractText(buffer: Buffer): Promise<string[]> {
  const data = await pdfParse(buffer);
  return (data.text as string)
    .split('\n')
    .map((l: string) => l.trim())
    .filter((l: string) => l.length > 0);
}

async function toDocx(lines: string[], title: string): Promise<Buffer> {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({ text: title, heading: HeadingLevel.HEADING_1 }),
        ...lines.map(line => new Paragraph({ text: line })),
      ],
    }],
  });
  return Packer.toBuffer(doc);
}

function toXlsx(lines: string[]): Buffer {
  const ws = XLSX.utils.aoa_to_sheet(lines.map(l => [l]));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Contenu');
  return Buffer.from(XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }));
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  const outputFormat = (formData.get('format') as string) ?? 'docx';

  if (!file) return NextResponse.json({ error: 'Fichier PDF manquant' }, { status: 400 });
  if (!file.name.toLowerCase().endsWith('.pdf')) {
    return NextResponse.json({ error: 'Le fichier doit être un PDF.' }, { status: 400 });
  }

  try {
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    const lines = await extractText(buffer);

    if (lines.length === 0) {
      return NextResponse.json({ error: 'Aucun texte extractible dans ce PDF (PDF scanné ?).' }, { status: 400 });
    }

    const baseName = file.name.replace(/\.pdf$/i, '');
    const filename = `${uuidv4()}.${outputFormat}`;
    const outputPath = path.join(OUTPUT_DIR, filename);

    if (outputFormat === 'docx') {
      const buf = await toDocx(lines, baseName);
      await fs.writeFile(outputPath, buf);
    } else {
      const buf = toXlsx(lines);
      await fs.writeFile(outputPath, buf);
    }

    return NextResponse.json({
      url: `/converted/${filename}`,
      filename,
      originalName: `${baseName}.${outputFormat}`,
      pageCount: lines.length,
    });
  } catch {
    return NextResponse.json({ error: 'Erreur lors de la conversion.' }, { status: 500 });
  }
}
