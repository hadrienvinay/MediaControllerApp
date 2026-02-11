import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { getPlaylistById, updatePlaylist } from '@/lib/storage';
import { Track } from '@/types/playlist';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const url = formData.get('url') as string;
    const playlistId = formData.get('playlistId') as string;
    const title = formData.get('title') as string;
    const source = formData.get('source') as 'youtube' | 'soundcloud';


    if (!url || !playlistId || !title || !source) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
    }

    // Récupérer la playlist
    const playlist = await getPlaylistById(playlistId);
    if (!playlist) {
      return NextResponse.json({ error: 'Playlist non trouvée' }, { status: 404 });
    }

    const audioDir = path.join(process.cwd(), 'public', 'audio');
    const filename = `${uuidv4()}.mp3`;
    const outputPath = path.join(audioDir, filename);

    // Utiliser yt-dlp pour télécharger l'audio
    // Note: yt-dlp doit être installé sur le système
    // Installation: pip install yt-dlp
    const command = `yt-dlp -x --audio-format mp3 -o "${outputPath}" "${url}"`;

    try {
      // Récupérer les métadonnées avec yt-dlp
      await execAsync(command);
    } catch (error) {
      console.error('Erreur yt-dlp:', error);
      return NextResponse.json({ 
        error: 'Erreur lors du téléchargement. Assurez-vous que yt-dlp est installé (pip install yt-dlp)' 
      }, { status: 500 });
    }

    // Ajouter le track à la playlist
    const newTrack: Track = {
      id: uuidv4(),
      title,
      filename,
      source,
      createdAt: new Date(),
      url: url,
    };

    const updatedTracks = [...playlist.tracks, newTrack];
    playlist.tracks = updatedTracks;
    await updatePlaylist(playlistId,playlist);

    return NextResponse.json({ success: true, track: newTrack }, { status: 201 });
  } catch (error) {
    console.error('Erreur download:', error);
    return NextResponse.json({ error: 'Erreur lors du téléchargement' }, { status: 500 });
  }
}
