import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { getPlaylistById, updatePlaylist } from '@/lib/storage';
import { Track } from '@/types/playlist';

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
      await execAsync(command);
    } catch (error) {
      console.error('Erreur yt-dlp:', error);
      return NextResponse.json({ error: parseYtdlpError(error) }, { status: 500 });
    }

    // Ajouter le track à la playlist
    const newTrack: Track = {
      id: uuidv4(),
      title,
      filename,
      source,
      createdAt: new Date(),
    };

    const updatedTracks = [...playlist.tracks, newTrack];
    await updatePlaylist(playlistId, { tracks: updatedTracks });

    return NextResponse.json({ success: true, track: newTrack }, { status: 201 });
  } catch (error) {
    console.error('Erreur download:', error);
    return NextResponse.json({ error: 'Erreur lors du téléchargement' }, { status: 500 });
  }
}
