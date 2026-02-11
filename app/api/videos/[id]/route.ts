import { NextRequest, NextResponse } from 'next/server';

import { deleteVideoProject, getVideoProjectById } from '@/lib/video-storage';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');          
        if (!id) {
          return NextResponse.json({ error: 'ID requis' }, { status: 400 });
        }   
        const playlist = await getVideoProjectById(id);
        if (!playlist) {
            return NextResponse.json({ error: 'Playlist non trouvée' }, { status: 404 });
        }
        return NextResponse.json(playlist);
    } catch (error) {
        return NextResponse.json({ error: 'Erreur lors de la récupération de la playlist' }, { status: 500 });
    }   
}

export async function DELETE(request: Request,{ params }: { params: Promise<{ id: string }> }) {
    console.log('Requête DELETE reçue avec params:', request, params);
  try {
    const { id: idString } = await params
    const id = parseInt(idString)
    console.log('ID reçu pour suppression:', id);

    // Vérifier que l'ID est un nombre valide
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID invalide' },
        { status: 400 }
      )
    }
    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    }

    const success = await deleteVideoProject(idString);

    if (!success) {
      return NextResponse.json({ error: 'Projet vidéo non trouvé' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 });
  }
}
