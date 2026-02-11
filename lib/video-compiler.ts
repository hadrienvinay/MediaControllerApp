import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import { promises as fs } from 'fs';
import { VideoSettings } from '@/types/video';

export interface CompileOptions extends VideoSettings {
  inputFiles: Array<{ path: string; type: 'video' | 'image' }>;
  outputFile: string;
}

/**
 * Compile plusieurs vidéos et images en une seule vidéo avec transitions
 */
export async function compileVideo(options: CompileOptions): Promise<void> {
  const {
    inputFiles,
    outputFile,
    transitionDuration = 1,
    transitionType = 'fade',
    imageDuration = 5,
    resolution = '1080p',
    fps = 30,
    audioTrack,
    includeAudio = true,
  } = options;

  return new Promise(async (resolve, reject) => {
    if (inputFiles.length === 0) {
      reject(new Error('Aucun fichier à compiler'));
      return;
    }

    // Résolutions disponibles
    const resolutionMap: { [key: string]: { width: number; height: number } } = {
      '720p': { width: 1280, height: 720 },
      '1080p': { width: 1920, height: 1080 },
      '4k': { width: 3840, height: 2160 },
    };

    const targetRes = resolutionMap[resolution];

    try {
      // Créer un fichier de concaténation temporaire
      const tempDir = path.dirname(outputFile);
      const concatFilePath = path.join(tempDir, `concat_${Date.now()}.txt`);
      const processedFilesDir = path.join(tempDir, 'processed');
      
      await fs.mkdir(processedFilesDir, { recursive: true });

      // Prétraiter chaque fichier (normaliser résolution, durée des images, etc.)
      const processedFiles: string[] = [];
      
      for (let i = 0; i < inputFiles.length; i++) {
        const file = inputFiles[i];
        const processedPath = path.join(processedFilesDir, `processed_${i}.mp4`);

        if (file.type === 'image') {
          // Convertir l'image en vidéo de durée fixe
          await new Promise<void>((res, rej) => {
            ffmpeg(file.path)
              .loop(imageDuration)
              .outputFPS(fps)
              .size(`${targetRes.width}x${targetRes.height}`)
              .videoCodec('libx264')
              .outputOptions([
                '-pix_fmt yuv420p',
                '-t', imageDuration.toString(),
              ])
              .output(processedPath)
              .on('end', () => res())
              .on('error', rej)
              .run();
          });
        } else {
          // Normaliser la vidéo (résolution, codec)
          await new Promise<void>((res, rej) => {
            let command = ffmpeg(file.path)
              .size(`${targetRes.width}x${targetRes.height}`)
              .videoCodec('libx264')
              .outputFPS(fps)
              .outputOptions(['-pix_fmt yuv420p']);

            if (includeAudio) {
              command = command.audioCodec('aac');
            } else {
              command = command.noAudio();
            }

            command
              .output(processedPath)
              .on('end', () => res())
              .on('error', rej)
              .run();
          });
        }

        processedFiles.push(processedPath);
      }

      // Créer le fichier de concaténation avec transitions
      if (transitionType === 'fade' && processedFiles.length > 1) {
        // Utiliser xfade filter pour les transitions
        await compileWithXfade(processedFiles, outputFile, transitionDuration, fps, audioTrack);
      } else {
        // Simple concaténation sans transitions complexes
        await simpleConcatenation(processedFiles, outputFile, audioTrack);
      }

      // Nettoyer les fichiers temporaires
      await fs.unlink(concatFilePath).catch(() => {});
      for (const file of processedFiles) {
        await fs.unlink(file).catch(() => {});
      }
      await fs.rmdir(processedFilesDir).catch(() => {});

      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Compilation avec transitions xfade (fondu)
 */
async function compileWithXfade(
  files: string[],
  outputFile: string,
  transitionDuration: number,
  fps: number,
  audioTrack?: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    // Construction du filtre complexe pour xfade
    let command = ffmpeg();
    
    // Ajouter tous les fichiers en entrée
    files.forEach(file => {
      command = command.input(file);
    });

    // Ajouter la piste audio si spécifiée
    if (audioTrack) {
      command = command.input(audioTrack);
    }

    // Construire les filtres xfade
    const filters: string[] = [];
    let currentStream = '[0:v]';

    for (let i = 0; i < files.length - 1; i++) {
      const nextStream = `[${i + 1}:v]`;
      const outputStream = i === files.length - 2 ? '[outv]' : `[v${i}]`;

      // Créer un xfade entre les vidéos
      // Note: xfade nécessite de connaître la durée des vidéos
      filters.push(
        `${currentStream}${nextStream}xfade=transition=fade:duration=${transitionDuration}:offset=${i * 10}${outputStream}`
      );

      currentStream = outputStream;
    }

    const outputOptions = ['-map', '[outv]'];
    
    if (audioTrack) {
      outputOptions.push('-map', `${files.length}:a`);
    }

    command
      .complexFilter(filters)
      .outputOptions(outputOptions)
      .outputOptions([
        '-c:v libx264',
        '-preset medium',
        '-crf 23',
        '-pix_fmt yuv420p',
      ])
      .output(outputFile)
      .on('start', (commandLine) => {
        console.log('FFmpeg command:', commandLine);
      })
      .on('progress', (progress) => {
        console.log(`Processing: ${progress.percent}% done`);
      })
      .on('end', () => {
        console.log('Compilation vidéo terminée');
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
 * Concaténation simple sans transitions
 */
async function simpleConcatenation(
  files: string[],
  outputFile: string,
  audioTrack?: string
): Promise<void> {
  return new Promise(async (resolve, reject) => {
    // Créer un fichier de liste pour concat demuxer
    const concatListPath = path.join(path.dirname(outputFile), 'concat_list.txt');
    const listContent = files.map(f => `file '${f}'`).join('\n');
    await fs.writeFile(concatListPath, listContent);

    let command = ffmpeg()
      .input(concatListPath)
      .inputOptions(['-f concat', '-safe 0']);

    if (audioTrack) {
      command = command.input(audioTrack);
      command = command.outputOptions([
        '-map 0:v',
        '-map 1:a',
      ]);
    }

    command
      .outputOptions([
        '-c:v libx264',
        '-preset medium',
        '-crf 23',
        '-pix_fmt yuv420p',
        '-c:a aac',
      ])
      .output(outputFile)
      .on('end', async () => {
        await fs.unlink(concatListPath).catch(() => {});
        resolve();
      })
      .on('error', async (err) => {
        await fs.unlink(concatListPath).catch(() => {});
        reject(err);
      })
      .run();
  });
}

/**
 * Obtenir la durée d'une vidéo
 */
export async function getVideoDuration(filePath: string): Promise<number> {
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
 * Générer une miniature pour une vidéo
 */
export async function generateThumbnail(
  videoPath: string,
  outputPath: string,
  timeOffset: number = 1
): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .screenshots({
        count: 1,
        timemarks: [timeOffset],
        filename: path.basename(outputPath),
        folder: path.dirname(outputPath),
        size: '320x240',
      })
      .on('end', () => resolve())
      .on('error', reject);
  });
}

/**
 * Obtenir les métadonnées d'une vidéo
 */
export async function getVideoMetadata(filePath: string): Promise<{
  duration: number;
  width: number;
  height: number;
  fps: number;
  hasAudio: boolean;
}> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        reject(err);
      } else {
        const videoStream = metadata.streams.find(s => s.codec_type === 'video');
        const audioStream = metadata.streams.find(s => s.codec_type === 'audio');

        resolve({
          duration: metadata.format.duration || 0,
          width: videoStream?.width || 0,
          height: videoStream?.height || 0,
          fps: eval(videoStream?.r_frame_rate || '30') as number,
          hasAudio: !!audioStream,
        });
      }
    });
  });
}
