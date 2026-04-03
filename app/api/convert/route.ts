import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { promises as fs } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { createConvertedFile, getConvertedFiles } from '@/lib/converter';

const execAsync = promisify(exec);

export async function GET() {
  try {
    const convertedFiles = await getConvertedFiles();
    return NextResponse.json(convertedFiles);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la récupération des playlists' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    //console.log('Requête reçue pour conversion:', request);
    const body = await request.json();
    const { url, format = 'mp3' } = body;

    if (!url) {
      return NextResponse.json({ error: 'URL manquante' }, { status: 400 });
    }

    const isVideo = format === 'mp4';
    const ext = isVideo ? 'mp4' : 'mp3';
    const outputDir = isVideo
      ? path.join(process.cwd(), 'public', 'videos', 'converted')
      : path.join(process.cwd(), 'public', 'audio', 'converted');

    // Ensure output directory exists
    try { await fs.mkdir(outputDir, { recursive: true }); } catch {}

    const filename = `${uuidv4()}.${ext}`;
    const outputPath = path.join(outputDir, filename);

    const command = isVideo
      ? `yt-dlp -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best" --merge-output-format mp4 -o "${outputPath}" "${url}"`
      : `yt-dlp -x --audio-format mp3 -o "${outputPath}" "${url}"`;

    const runCommand = async (cmd: string) => {
      const { stdout } = await execAsync(cmd);
      return stdout.trim();
    };

    let title = 'Fichier Converti';
    let duration = '';
    let thumbnail = '';
    try {
      [title, duration, thumbnail] = await Promise.all([
        runCommand(`yt-dlp --get-title "${url}"`),
        runCommand(`yt-dlp --get-duration "${url}"`),
        runCommand(`yt-dlp --get-thumbnail "${url}"`),
      ]);
    } catch (error) {
      console.error('Erreur lors de la récupération des métadonnées:', error);
    }

    try {
      await execAsync(command, { maxBuffer: 100 * 1024 * 1024 });
    } catch (error) {
      console.error('Erreur yt-dlp:', error);
      return NextResponse.json({
        error: 'Erreur lors du téléchargement. Assurez-vous que yt-dlp est installé (pip install yt-dlp)'
      }, { status: 500 });
    }

    await createConvertedFile({
      title,
      duration,
      filename,
      thumbnail,
      source: 'youtube',
    });

    const mediaPath = isVideo ? 'videos/converted' : 'audio/converted';
    return NextResponse.json({
      metadata: { title, duration, thumbnail, format: ext },
      responseUrl: `/converter/create?file=${filename}&format=${ext}&dir=${mediaPath}`,
    }, { status: 200 });

  } catch (error) {
    console.error('Erreur metadata:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération des métadonnées' }, { status: 500 });
  }
}