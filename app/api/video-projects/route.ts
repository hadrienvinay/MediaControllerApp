import { NextRequest, NextResponse } from 'next/server';
import { getVideoProjects, createVideoProject, deleteVideoProject } from '@/lib/video-storage';

export async function GET() {
  try {
    const projects = await getVideoProjects();
    return NextResponse.json(projects);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des projets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, settings } = body;

    if (!name) {
      return NextResponse.json({ error: 'Le nom est requis' }, { status: 400 });
    }

    const project = await createVideoProject({
      name,
      description: description || '',
      media: [],
      settings: settings || {
        transitionDuration: 1,
        transitionType: 'fade',
        imageDuration: 5,
        resolution: '1080p',
        fps: 30,
        includeAudio: true,
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la création du projet' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    }

    const success = await deleteVideoProject(id);
    if (!success) {
      return NextResponse.json({ error: 'Projet non trouvé' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 });
  }
}
