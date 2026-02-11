import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import { promises as fs } from 'fs';

export interface MixOptions {
  crossfadeDuration?: number; // Durée du fondu enchaîné en secondes (défaut: 3)
}

/**
 * Fusionne plusieurs fichiers MP3 avec des transitions douces (crossfade)
 */
export async function mixTracks(
  inputFiles: string[],
  outputFile: string,
  options: MixOptions = {}
): Promise<void> {
  const crossfadeDuration = options.crossfadeDuration || 3;

  return new Promise((resolve, reject) => {
    if (inputFiles.length === 0) {
      reject(new Error('Aucun fichier à fusionner'));
      return;
    }

    if (inputFiles.length === 1) {
      // Un seul fichier, juste copier
      fs.copyFile(inputFiles[0], outputFile)
        .then(() => resolve())
        .catch(reject);
      return;
    }

    // Construire la commande ffmpeg avec filtres complexes pour les transitions
    let command = ffmpeg();

    // Ajouter tous les fichiers en entrée
    inputFiles.forEach((file) => {
      command = command.input(file);
    });

    // Construire le filtre complexe pour les crossfades
    const filters: string[] = [];
    let currentStream = '[0:a]';

    for (let i = 0; i < inputFiles.length - 1; i++) {
      const nextStream = `[${i + 1}:a]`;
      const outputStream = i === inputFiles.length - 2 ? '[out]' : `[a${i}]`;

      // Créer un crossfade entre les pistes
      filters.push(
        `${currentStream}${nextStream}acrossfade=d=${crossfadeDuration}:c1=tri:c2=tri${outputStream}`
      );

      currentStream = outputStream;
    }

    command
      .complexFilter(filters)
      .outputOptions(['-map', '[out]'])
      .output(outputFile)
      .on('start', (commandLine) => {
        console.log('FFmpeg command:', commandLine);
      })
      .on('progress', (progress) => {
        console.log(`Processing: ${progress.percent}% done`);
      })
      .on('end', () => {
        console.log('Mixing terminé avec succès');
        resolve();
      })
      .on('error', (err) => {
        console.error('Erreur FFmpeg:', err);
        reject(err);
      })
      .run();
  });
}

/**
 * Obtenir la durée d'un fichier audio en secondes
 */
export async function getAudioDuration(filePath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        reject(err);
      } else {
        resolve(metadata.format.duration || 0);
      }
    });
  });
}

/**
 * Obtenir les métadonnées d'un fichier audio
 */
export async function getAudioMetadata(filePath: string): Promise<{
  duration: number;
  artist?: string;
  title?: string;
  album?: string;
}> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        reject(err);
      } else {
        const tags = metadata.format.tags || {};
        resolve({
          duration: metadata.format.duration || 0,
          artist: tags.artist,
          title: tags.title,
          album: tags.album,
        });
      }
    });
  });
}
