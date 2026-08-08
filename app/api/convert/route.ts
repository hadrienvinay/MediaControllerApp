import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { promises as fs } from 'fs';
import { randomUUID } from 'crypto';
import { createConvertedFile, getConvertedFiles, getConvertedFilebyId, deleteConvertedFile } from '@/lib/converter';

const execAsync = promisify(exec);


/** Sanitize a filename produced by yt-dlp. Falls back to a UUID if the result is unusable. */
function sanitizeFilename(name: string, ext: string): string {
  // Strip directory separators and characters forbidden on most filesystems
  let safe = name
    .replace(/[/\\]/g, '-')         // path separators → dash
    .replace(/[<>:"|?*\x00-\x1f]/g, '') // Windows-forbidden + control chars
    .replace(/\.{2,}/g, '.')        // collapse multiple dots
    .trim()
    .replace(/[. ]+$/, '');         // no trailing dots/spaces (Windows)

  // If the result is empty or suspiciously short, use a UUID
  if (!safe || safe.replace(/[^a-zA-Z0-9]/g, '').length < 2) {
    return `${randomUUID()}.${ext}`;
  }

  // Enforce a max length (255 bytes is the fs limit; keep headroom for the extension)
  const maxBase = 200;
  const base = safe.endsWith(`.${ext}`) ? safe.slice(0, -ext.length - 1) : safe;
  const trimmedBase = base.slice(0, maxBase);
  return `${trimmedBase}.${ext}`;
}

function parseYtdlpError(error: unknown): string {
  const stderr = (error as { stderr?: string }).stderr || (error as Error).message || '';
  if (stderr.includes('not available')) return 'Cette vidéo n\'est pas disponible (privée, supprimée ou restreinte géographiquement).';
  if (stderr.includes('Private video')) return 'Cette vidéo est privée.';
  if (stderr.includes('age')) return 'Cette vidéo est restreinte par l\'âge.';
  if (stderr.includes('copyright')) return 'Cette vidéo a été retirée pour droits d\'auteur.';
  if (stderr.includes('not found') || stderr.includes('No such')) return 'yt-dlp n\'est pas installé. Installez-le avec : pip install yt-dlp';
  return `Erreur lors du téléchargement : ${stderr.split('\n').filter(l => l.includes('ERROR')).pop() || 'erreur inconnue'}`;
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID manquant' }, { status: 400 });

  const entry = await getConvertedFilebyId(id);
  if (!entry) return NextResponse.json({ error: 'Fichier introuvable' }, { status: 404 });

  const candidates = [
    path.join(process.cwd(), 'public', 'audio', 'converted', entry.filename),
    path.join(process.cwd(), 'public', 'videos', 'converted', entry.filename),
    path.join(process.cwd(), 'public', 'audio', entry.filename),
  ];
  for (const filePath of candidates) {
    try { await fs.unlink(filePath); break; } catch { /* not found there, try next */ }
  }

  await deleteConvertedFile(id);
  return NextResponse.json({ success: true });
}

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
    const body = await request.json();
    const { url, format = 'mp3' } = body;

    if (!url) {
      return NextResponse.json({ error: 'URL manquante' }, { status: 400 });
    }

    const isVideo = format === 'mp4';
    const ext = isVideo ? 'mp4' : format === 'flac' ? 'flac' : 'mp3';
    const outputDir = isVideo
      ? path.join(process.cwd(), 'public', 'videos', 'converted')
      : path.join(process.cwd(), 'public', 'audio', 'converted');

    await fs.mkdir(outputDir, { recursive: true });

    const runCommand = async (cmd: string) => {
      const { stdout } = await execAsync(cmd);
      return stdout.trim();
    };

    // Fetch metadata and the exact filename yt-dlp will produce — all in parallel
    let title = 'Fichier Converti';
    let duration = '';
    let thumbnail = '';
    let resolvedFilename = '';
    try {
      // Use the final target extension (not %(ext)s which resolves to the source container)
      const filenameTemplate = `%(uploader)s - %(title)s.${ext}`;

      [title, duration, thumbnail, resolvedFilename] = await Promise.all([
        runCommand(`yt-dlp --get-title "${url}"`),
        runCommand(`yt-dlp --get-duration "${url}"`),
        runCommand(`yt-dlp --get-thumbnail "${url}"`),
        runCommand(`yt-dlp --print filename -o "${filenameTemplate}" "${url}"`),
      ]);
    } catch (error) {
      console.error('Erreur lors de la récupération des métadonnées:', error);
    }

    // Sanitize the resolved name; fall back to UUID if it's empty or invalid
    const rawFilename = resolvedFilename || `${title || 'audio'}.${ext}`;
    const filename = sanitizeFilename(rawFilename, ext);
    const outputPath = path.join(outputDir, filename);

    const command = isVideo
      ? `yt-dlp -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best" --merge-output-format mp4 -o "${outputPath}" "${url}"`
      : `yt-dlp -x --audio-format ${ext} -o "${outputPath}" "${url}"`;

    try {
      await execAsync(command, { maxBuffer: 100 * 1024 * 1024 });
    } catch (error) {
      console.error('Erreur yt-dlp:', error);
      return NextResponse.json({ error: parseYtdlpError(error) }, { status: 500 });
    }

    await createConvertedFile({
      title,
      displayName: filename,
      duration,
      filename,
      thumbnail,
      source: 'youtube',
    });

    const mediaPath = isVideo ? 'videos/converted' : 'audio/converted';
    return NextResponse.json({
      metadata: { title, duration, thumbnail, format: ext },
      responseUrl: `/converter/create?file=${encodeURIComponent(filename)}&format=${ext}&dir=${mediaPath}`,
    }, { status: 200 });

  } catch (error) {
    console.error('Erreur metadata:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération des métadonnées' }, { status: 500 });
  }
}