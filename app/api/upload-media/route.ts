import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { getVideoProjectById, updateVideoProject } from '@/lib/video-storage';
import { MediaItem } from '@/types/video';
import { generateThumbnail, getVideoDuration } from '@/lib/video-compiler';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const projectId = formData.get('projectId') as string;
    const title = formData.get('title') as string;
    const type = formData.get('type') as 'video' | 'image';

    if (!file || !projectId || !title || !type) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
    }

    // Vérifier le type de fichier
    const isVideo = type === 'video';
    const expectedType = isVideo ? 'video' : 'image';
    if (!file.type.includes(expectedType)) {
      return NextResponse.json(
        { error: `Le fichier doit être un ${expectedType}` },
        { status: 400 }
      );
    }

    // Créer les dossiers si nécessaire
    const mediaDir = path.join(
      process.cwd(),
      'public',
      isVideo ? 'videos' : 'images'
    );
    const thumbDir = path.join(process.cwd(), 'public', 'thumbnails');
    
    await mkdir(mediaDir, { recursive: true });
    await mkdir(thumbDir, { recursive: true });

    // Générer un nom de fichier unique
    const fileExtension = path.extname(file.name);
    const filename = `${uuidv4()}${fileExtension}`;
    const filepath = path.join(mediaDir, filename);

    // Sauvegarder le fichier
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Générer une miniature pour les vidéos
    let thumbnail: string | undefined;
    let duration: number | undefined;

    if (isVideo) {
      try {
        const thumbFilename = `${uuidv4()}.jpg`;
        const thumbPath = path.join(thumbDir, thumbFilename);
        await generateThumbnail(filepath, thumbPath, 1);
        thumbnail = thumbFilename;
        duration = await getVideoDuration(filepath);
      } catch (error) {
        console.error('Erreur génération miniature:', error);
      }
    }

    // Récupérer le projet et ajouter le média
    const project = await getVideoProjectById(projectId);
    if (!project) {
      return NextResponse.json({ error: 'Projet non trouvé' }, { status: 404 });
    }

    const newMedia: MediaItem = {
      id: uuidv4(),
      title,
      type,
      filename,
      source: 'upload',
      thumbnail,
      duration,
      createdAt: new Date(),
    };

    const updatedMedia = [...project.media, newMedia];
    await updateVideoProject(projectId, { media: updatedMedia });

    return NextResponse.json({ success: true, media: newMedia }, { status: 201 });
  } catch (error) {
    console.error('Erreur upload:', error);
    return NextResponse.json({ error: "Erreur lors de l'upload" }, { status: 500 });
  }
}
