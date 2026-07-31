import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import os from 'os';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { url, lang = 'en', format = 'vtt' } = body;

  if (!url?.trim()) return NextResponse.json({ error: 'URL manquante' }, { status: 400 });

  const tmpDir = os.tmpdir();
  const basename = path.join(tmpDir, `subs_${uuidv4()}`);

  try {
    const cmd = [
      'yt-dlp',
      '--write-subs',
      '--write-auto-subs',
      `--sub-langs "${lang}"`,
      `--sub-format ${format}`,
      '--skip-download',
      '--no-playlist',
      `-o "${basename}"`,
      `"${url}"`,
    ].join(' ');

    await execAsync(cmd, { timeout: 60_000 });

    // Find the generated subtitle file
    const files = await fs.readdir(tmpDir);
    const match = files.find(f => f.startsWith(path.basename(basename)) && (f.endsWith('.vtt') || f.endsWith('.srt')));

    if (!match) {
      return NextResponse.json({ error: 'Aucun sous-titre disponible pour cette vidéo / cette langue.' }, { status: 404 });
    }

    const filePath = path.join(tmpDir, match);
    const content = await fs.readFile(filePath, 'utf-8');
    await fs.unlink(filePath).catch(() => {});

    const detectedLang = match.split('.').slice(-2, -1)[0] ?? lang;
    return NextResponse.json({ content, filename: match, lang: detectedLang });
  } catch (error) {
    const stderr = (error as { stderr?: string }).stderr ?? '';
    if (stderr.includes('not found') || stderr.includes('No such')) {
      return NextResponse.json({ error: 'yt-dlp non installé.' }, { status: 503 });
    }
    if (stderr.includes('Private') || stderr.includes('not available')) {
      return NextResponse.json({ error: 'Vidéo privée ou indisponible.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Impossible d\'extraire les sous-titres.' }, { status: 500 });
  }
}
