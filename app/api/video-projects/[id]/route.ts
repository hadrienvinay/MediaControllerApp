import { NextRequest, NextResponse } from 'next/server';
import { getVideoProjectById, updateVideoProject } from '@/lib/video-storage';

export async function PUT( request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } =  params;
    const body = await request.json();
    const { name, description, media, settings } = body;

    // Vérifier que le projet existe
    const existing = await getVideoProjectById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Projet non trouvé' }, { status: 404 });
    }

    // Mettre à jour le projet
    const updated = await updateVideoProject(id, {
      name,
      description,
      media,
      settings,
      // Invalider la compilation si les médias ont changé
      compiledVideo: undefined,
      compiledDuration: undefined,
      compileError: undefined,
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
