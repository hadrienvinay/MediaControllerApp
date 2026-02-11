import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { getPlaylistById, updatePlaylist } from '@/lib/storage';
import { mixTracks, getAudioDuration } from '@/lib/audio-mixer';

export async function POST(request: NextRequest) {
  try {
    const { playlistId } = await request.json();

    if (!playlistId) {
      return NextResponse.json({ error: 'ID de playlist requis' }, { status: 400 });
    }

    // Récupérer la playlist
    const playlist = await getPlaylistById(playlistId);
    if (!playlist) {
      return NextResponse.json({ error: 'Playlist non trouvée' }, { status: 404 });
    }

    if (playlist.tracks.length === 0) {
      return NextResponse.json({ error: 'Aucun titre dans la playlist' }, { status: 400 });
    }

    // Marquer la playlist comme "en cours de mixage"
    await updatePlaylist(playlistId, { isMixing: true, mixError: undefined });

    // Préparer les fichiers d'entrée
    const audioDir = path.join(process.cwd(), 'public', 'audio');
    const inputFiles = playlist.tracks.map((track) =>
      path.join(audioDir, track.filename)
    );

    // Nom du fichier de sortie
    const outputFilename = `mix_${playlistId}_${Date.now()}.mp3`;
    const outputPath = path.join(audioDir, outputFilename);

    try {
      // Lancer le mixage avec crossfade de 3 secondes
      await mixTracks(inputFiles, outputPath, { crossfadeDuration: 3 });

      // Obtenir la durée du fichier mixé
      const duration = await getAudioDuration(outputPath);

      // Mettre à jour la playlist avec le fichier mixé
      await updatePlaylist(playlistId, {
        mixedFile: outputFilename,
        mixedDuration: duration,
        isMixing: false,
        mixError: undefined,
      });

      return NextResponse.json({
        success: true,
        mixedFile: outputFilename,
        duration,
      });
    } catch (mixError: any) {
      console.error('Erreur lors du mixage:', mixError);

      // Marquer l'erreur dans la playlist
      await updatePlaylist(playlistId, {
        isMixing: false,
        mixError: mixError.message || 'Erreur lors du mixage',
      });

      return NextResponse.json(
        { error: 'Erreur lors du mixage audio', details: mixError.message },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Erreur API mix:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', details: error.message },
      { status: 500 }
    );
  }
}
