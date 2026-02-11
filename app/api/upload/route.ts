import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { getPlaylistById, updatePlaylist } from '@/lib/storage';
import { Track } from '@/types/playlist';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const playlistId = formData.get('playlistId') as string;
    const title = formData.get('title') as string;
    const url = formData.get('url') as string;

    if (!file || !playlistId || !title) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
    }

    // Vérifier que c'est bien un fichier MP3
    if (!file.type.includes('audio')) {
      return NextResponse.json({ error: 'Le fichier doit être un fichier audio' }, { status: 400 });
    }

    // Créer le dossier audio s'il n'existe pas
    const audioDir = path.join(process.cwd(), 'public', 'audio');
    try {
      await mkdir(audioDir, { recursive: true });
    } catch (error) {
      // Le dossier existe déjà
    }

    // Générer un nom de fichier unique
    const fileExtension = path.extname(file.name);
    const filename = `${uuidv4()}${fileExtension}`;
    const filepath = path.join(audioDir, filename);

    // Sauvegarder le fichier
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Récupérer la playlist et ajouter le track
    const playlist = await getPlaylistById(playlistId);
    if (!playlist) {
      return NextResponse.json({ error: 'Playlist non trouvée' }, { status: 404 });
    }

    const newTrack: Track = {
      id: uuidv4(),
      title,
      filename,
      source: 'upload',
      createdAt: new Date(),
      url: url

    };

    const updatedTracks = [...playlist.tracks, newTrack];
    playlist.tracks = updatedTracks;
    await updatePlaylist(playlistId,playlist);

    return NextResponse.json({ success: true, track: newTrack }, { status: 201 });
  } catch (error) {
    console.error('Erreur upload:', error);
    return NextResponse.json({ error: 'Erreur lors de l\'upload' }, { status: 500 });
  }
}

// Désactiver le body parser par défaut de Next.js pour gérer les fichiers
export const config = {
  api: {
    bodyParser: false,
  },
};