import { NextRequest, NextResponse } from 'next/server';
import { getPlaylists, createPlaylist, deletePlaylist, updatePlaylist, getPlaylistById } from '@/lib/storage';

export async function GET() {
  try {
    const playlists = await getPlaylists();
    return NextResponse.json(playlists);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la récupération des playlists' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json({ error: 'Le nom est requis' }, { status: 400 });
    }

    const playlist = await createPlaylist({
      name,
      description: description || '',
      tracks: [],
    });

    return NextResponse.json(playlist, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la création de la playlist' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    }

    const success = await deletePlaylist(id);
    if (!success) {
      return NextResponse.json({ error: 'Playlist non trouvée' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 });
  }
}


export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
  

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    }
    const playlistData = await getPlaylistById(id);
    if (!playlistData) {
      return NextResponse.json({ error: 'Playlist non trouvée' }, { status: 404 });
    }

    const updatedPlaylist = await updatePlaylist(id, playlistData);

    if (!updatedPlaylist) {
      return NextResponse.json({ error: 'Playlist non trouvée' }, { status: 404 });
    }

    return NextResponse.json(updatedPlaylist);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la mise à jour de la playlist' }, { status: 500 });
  }
}
