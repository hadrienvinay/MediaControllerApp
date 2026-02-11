import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    //console.log('Requête reçue pour conversion:', request);
    const body = await request.json();
    const { url } = body

    if (!url) {
      return NextResponse.json({ error: 'URL manquante' }, { status: 400 });
    }

    // Logique pour recuperer les métadonnées de l'audio (Optionnel, peut être utilisé pour nommer le fichier de sortie)
    const audioDir = path.join(process.cwd(), 'public', 'audio', 'converted');
    const filename = `${uuidv4()}.mp3`;
    const outputPath = path.join(audioDir, filename);
    console.log('Chemin de sortie pour la conversion:', outputPath);

    // Utiliser yt-dlp pour télécharger l'audio
    // Note: yt-dlp doit être installé sur le système
    // Installation: pip install yt-dlp
    const command = `yt-dlp -x --audio-format mp3 -o "${outputPath}" "${url}"`;
     const runCommand = async (command: string) => {
      const { stdout } = await execAsync(command);
      return stdout.trim();
    };
    let title = 'Fichier Converti';
    let author = 'Inconnu';
    let duration = '';
    let thumbnail = '';
    try {
       [title, duration, thumbnail] = await Promise.all([
      runCommand(`yt-dlp --get-title "${url}"`),
      //runCommand(`yt-dlp --get-author "${url}"`),
      runCommand(`yt-dlp --get-duration "${url}"`),
      runCommand(`yt-dlp --get-thumbnail "${url}"`),
    ]);
    } catch (error) {
      console.error('Erreur lors de la récupération des métadonnées:', error);
    }
    try {
      // Récupérer les métadonnées avec yt-dlp
      await execAsync(command);
     
    } catch (error) {
      console.error('Erreur yt-dlp:', error);
      return NextResponse.json({ 
        error: 'Erreur lors du téléchargement. Assurez-vous que yt-dlp est installé (pip install yt-dlp)' 
      }, { status: 500 });
    }
    
    console.log('Métadonnées récupérées:', { title, author, duration, thumbnail });
    return NextResponse.json({ metadata: {
        title,
        author,
        duration,
        thumbnail,
      }, responseUrl: `/converter?file=${filename}` }, { status: 200 });

  } catch (error) {
    console.error('Erreur metadata:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération des métadonnées' }, { status: 500 });
  }
}