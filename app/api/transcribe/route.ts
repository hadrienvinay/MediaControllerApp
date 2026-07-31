import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import os from 'os';

const execAsync = promisify(exec);

const SUPPORTED = ['mp3', 'mp4', 'wav', 'ogg', 'flac', 'm4a', 'webm'];

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  const lang = (formData.get('lang') as string) || 'auto';
  const outputFormat = (formData.get('format') as string) || 'txt';

  if (!file) return NextResponse.json({ error: 'Fichier audio manquant' }, { status: 400 });

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'mp3';
  if (!SUPPORTED.includes(ext)) {
    return NextResponse.json({ error: `Format non supporté. Utilisez : ${SUPPORTED.join(', ')}` }, { status: 400 });
  }

  const tmpDir = os.tmpdir();
  const inputPath = path.join(tmpDir, `whisper_${uuidv4()}.${ext}`);
  const outputDir = path.join(tmpDir, `whisper_out_${uuidv4()}`);

  try {
    await fs.mkdir(outputDir, { recursive: true });
    await fs.writeFile(inputPath, Buffer.from(await file.arrayBuffer()));

    const langFlag = lang !== 'auto' ? `--language ${lang}` : '';
    const cmd = `whisper "${inputPath}" --output_format ${outputFormat} --output_dir "${outputDir}" ${langFlag}`;
    await execAsync(cmd, { timeout: 600_000, maxBuffer: 50 * 1024 * 1024 });

    const baseName = path.basename(inputPath, `.${ext}`);
    const outFile = path.join(outputDir, `${baseName}.${outputFormat}`);
    const content = await fs.readFile(outFile, 'utf-8');

    await fs.unlink(inputPath).catch(() => {});
    await fs.rm(outputDir, { recursive: true, force: true }).catch(() => {});

    return NextResponse.json({ content, filename: `${file.name.replace(`.${ext}`, '')}.${outputFormat}` });
  } catch (error) {
    await fs.unlink(inputPath).catch(() => {});
    await fs.rm(outputDir, { recursive: true, force: true }).catch(() => {});

    const msg = (error as { stderr?: string }).stderr ?? (error as Error).message ?? '';
    if (msg.includes('not found') || msg.includes('No such')) {
      return NextResponse.json({
        error: 'Whisper non installé. Installez-le avec : pip install openai-whisper',
      }, { status: 503 });
    }
    return NextResponse.json({ error: `Erreur lors de la transcription : ${msg || String(error)}` }, { status: 500 });
  }
}
