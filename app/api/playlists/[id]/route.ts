import { NextRequest, NextResponse } from 'next/server';
import { getPlaylistById, updatePlaylist } from '@/lib/storage';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, description, tracks } = body;

    // Vérifier que la playlist existe
    const existing = await getPlaylistById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Playlist non trouvée' }, { status: 404 });
    }

    // Mettre à jour la playlist
    const updated = await updatePlaylist(id, {
      name,
      description,
      tracks,
      // Invalider le mix si les tracks ont changé
      mixedFile: undefined,
      mixedDuration: undefined,
      mixError: undefined,
    });

    if (!updated) {
      return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
