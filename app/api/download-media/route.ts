import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { getVideoProjectById, updateVideoProject } from '@/lib/video-storage';
import { MediaItem } from '@/types/video';
import { generateThumbnail, getVideoDuration } from '@/lib/video-compiler';
import { checkYtdlpHealth } from '@/lib/ytdlp';

function parseYtdlpError(error: unknown): string {
  const stderr = (error as { stderr?: string }).stderr || (error as Error).message || '';
  if (stderr.includes('not available')) return 'Cette vidéo n\'est pas disponible (privée, supprimée ou restreinte géographiquement).';
  if (stderr.includes('Private video')) return 'Cette vidéo est privée.';
  if (stderr.includes('age')) return 'Cette vidéo est restreinte par l\'âge.';
  if (stderr.includes('copyright')) return 'Cette vidéo a été retirée pour droits d\'auteur.';
  if (stderr.includes('not found') || stderr.includes('No such')) return 'yt-dlp n\'est pas installé. Installez-le avec : pip install yt-dlp';
  return `Erreur lors du téléchargement : ${stderr.split('\n').filter(l => l.includes('ERROR')).pop() || 'erreur inconnue'}`;
}

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const url = formData.get('url') as string;
    const projectId = formData.get('projectId') as string;
    const title = formData.get('title') as string;
    const type = formData.get('type') as 'video' | 'image';
    const source = formData.get('source') as 'youtube' | 'url';

    if (!url || !projectId || !title || !type || !source) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
    }

    if (source === 'youtube') {
      const ytdlpHealth = await checkYtdlpHealth();
      if (!ytdlpHealth.ok) {
        return NextResponse.json({ error: ytdlpHealth.blockingError }, { status: 503 });
      }
      if (ytdlpHealth.warning) {
        console.warn(ytdlpHealth.warning);
      }
    }

    // Récupérer le projet
    const project = await getVideoProjectById(projectId);
    if (!project) {
      return NextResponse.json({ error: 'Projet non trouvé' }, { status: 404 });
    }

    const mediaDir = path.join(process.cwd(), 'public', type === 'video' ? 'videos' : 'images');
    const thumbDir = path.join(process.cwd(), 'public', 'thumbnails');
    const filename = `${uuidv4()}.${type === 'video' ? 'mp4' : 'jpg'}`;
    const outputPath = path.join(mediaDir, filename);

    let thumbnail: string | undefined;
    let duration: number | undefined;

    if (source === 'youtube' && type === 'video') {
      // Télécharger la vidéo depuis YouTube avec yt-dlp
      const command = `yt-dlp -f 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best' --merge-output-format mp4 -o "${outputPath}" "${url}"`;

      try {
        await execAsync(command);

        // Générer la miniature
        const thumbFilename = `${uuidv4()}.jpg`;
        const thumbPath = path.join(thumbDir, thumbFilename);
        await generateThumbnail(outputPath, thumbPath, 1);
        thumbnail = thumbFilename;
        duration = await getVideoDuration(outputPath);
      } catch (error) {
        console.error('Erreur yt-dlp:', error);
        return NextResponse.json(
          {
            error: parseYtdlpError(error),
          },
          { status: 500 }
        );
      }
    } else if (type === 'image') {
      // Télécharger l'image depuis l'URL
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Impossible de télécharger l\'image');
        }
        const buffer = await response.arrayBuffer();
        await require('fs/promises').writeFile(outputPath, Buffer.from(buffer));
      } catch (error) {
        console.error('Erreur téléchargement image:', error);
        return NextResponse.json(
          { error: 'Erreur lors du téléchargement de l\'image' },
          { status: 500 }
        );
      }
    }

    // Ajouter le média au projet
    const newMedia: MediaItem = {
      id: uuidv4(),
      title,
      type,
      filename,
      source,
      thumbnail,
      duration,
      createdAt: new Date(),
    };

    const updatedMedia = [...project.media, newMedia];
    await updateVideoProject(projectId, { media: updatedMedia });

    return NextResponse.json({ success: true, media: newMedia }, { status: 201 });
  } catch (error: any) {
    console.error('Erreur download:', error);
    return NextResponse.json(
      { error: 'Erreur lors du téléchargement', details: error.message },
      { status: 500 }
    );
  }
}
