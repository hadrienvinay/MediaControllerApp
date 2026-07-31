import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import os from 'os';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) return NextResponse.json({ error: 'Fichier manquant' }, { status: 400 });

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'png';
  if (!['png', 'jpg', 'jpeg', 'webp'].includes(ext)) {
    return NextResponse.json({ error: 'Format non supporté. Utilisez PNG, JPG ou WebP.' }, { status: 400 });
  }

  const tmpDir = os.tmpdir();
  const inputPath = path.join(tmpDir, `bgrm_in_${uuidv4()}.${ext}`);
  const outputFilename = `${uuidv4()}.png`;
  const outputDir = path.join(process.cwd(), 'public', 'converted');
  const outputPath = path.join(outputDir, outputFilename);

  try {
    await fs.mkdir(outputDir, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(inputPath, buffer);

    await execAsync(`rembg i "${inputPath}" "${outputPath}"`, { timeout: 120_000 });

    await fs.unlink(inputPath).catch(() => {});
    return NextResponse.json({ url: `/converted/${outputFilename}`, filename: outputFilename });
  } catch (error) {
    await fs.unlink(inputPath).catch(() => {});
    const e = error as { stderr?: string; stdout?: string; message?: string };
    const output = [e.stderr, e.stdout, e.message].filter(Boolean).join('\n');
    if (output.includes('onnxruntime') || output.includes('No module') || output.includes('not found') || output.includes('No such')) {
      return NextResponse.json({
        error: 'rembg non installé ou mal configuré. Installez-le avec : pip3 install "rembg[cpu]"',
      }, { status: 503 });
    }
    return NextResponse.json({ error: `Erreur lors de la suppression du fond : ${output || String(error)}` }, { status: 500 });
  }
}
