import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { getVideoProjectById, updateVideoProject } from '@/lib/video-storage';
import { compileVideo, getVideoDuration, calculateExpectedDuration } from '@/lib/video-compiler';

export async function POST(request: NextRequest) {
  try {
    const { projectId } = await request.json();

    if (!projectId) {
      return NextResponse.json({ error: 'ID de projet requis' }, { status: 400 });
    }

    // Récupérer le projet
    const project = await getVideoProjectById(projectId);
    if (!project) {
      return NextResponse.json({ error: 'Projet non trouvé' }, { status: 404 });
    }

    if (project.media.length === 0) {
      return NextResponse.json({ error: 'Aucun média dans le projet' }, { status: 400 });
    }

    // Marquer le projet comme "en cours de compilation"
    await updateVideoProject(projectId, { isCompiling: true, compileError: undefined });

    // Préparer les fichiers d'entrée
    const inputFiles = project.media.map((item) => {
      const dir = item.type === 'video' ? 'videos' : 'images';
      return {
        path: path.join(process.cwd(), 'public', dir, item.filename),
        type: item.type,
      };
    });

    // Calculer la durée théorique attendue
    const clipDurations = project.media.map((item) => {
      if (item.type === 'image') {
        return project.settings.imageDuration || 5;
      } else {
        return item.duration || 0;
      }
    });
    
    const expectedDuration = calculateExpectedDuration(
      clipDurations,
      project.settings.transitionDuration || 1
    );

    console.log('📊 Durées des clips:', clipDurations);
    console.log('🎬 Durée attendue:', expectedDuration.toFixed(2), 'secondes');

    // Nom du fichier de sortie
    const outputFilename = `compiled_${projectId}_${Date.now()}.mp4`;
    const outputPath = path.join(process.cwd(), 'public', 'videos', outputFilename);

    try {
      // Lancer la compilation
      await compileVideo({
        inputFiles,
        outputFile: outputPath,
        ...project.settings,
      });

      // Obtenir la durée du fichier compilé
      const actualDuration = await getVideoDuration(outputPath);
      
      console.log('✅ Durée réelle:', actualDuration.toFixed(2), 'secondes');
      console.log('📐 Différence:', Math.abs(actualDuration - expectedDuration).toFixed(2), 'secondes');

      // Vérifier que la durée est cohérente (tolérance de 0.5s)
      const durationDiff = Math.abs(actualDuration - expectedDuration);
      if (durationDiff > 0.5) {
        console.warn(`⚠️  Attention: Différence de durée importante (${durationDiff.toFixed(2)}s)`);
      }

      // Mettre à jour le projet avec le fichier compilé
      await updateVideoProject(projectId, {
        compiledVideo: outputFilename,
        compiledDuration: actualDuration,
        isCompiling: false,
        compileError: undefined,
      });

      return NextResponse.json({
        success: true,
        compiledVideo: outputFilename,
        duration: actualDuration,
        expectedDuration,
        durationDifference: durationDiff,
      });
    } catch (compileError: any) {
      console.error('Erreur lors de la compilation:', compileError);

      // Marquer l'erreur dans le projet
      await updateVideoProject(projectId, {
        isCompiling: false,
        compileError: compileError.message || 'Erreur lors de la compilation',
      });

      return NextResponse.json(
        { error: 'Erreur lors de la compilation vidéo', details: compileError.message },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Erreur API compile:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', details: error.message },
      { status: 500 }
    );
  }
}
