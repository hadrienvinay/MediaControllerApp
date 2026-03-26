import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import {
  convertImagesToPdf,
  mergePdfs,
  convertImageFormat,
  pdfToImages,
  splitPdf,
  compressImage,
  videoToGif,
  htmlToPdf,
  videoToAudio,
  resizeCompressVideo,
} from '@/lib/file-converter';
import { getFileConversions, createFileConversion, deleteFileConversion } from '@/lib/file-conversion-storage';
import { ConversionType } from '@/types/file-conversion';

const CONVERTED_DIR = path.join(process.cwd(), 'public', 'converted');

async function ensureConvertedDir() {
  try {
    await fs.access(CONVERTED_DIR);
  } catch {
    await fs.mkdir(CONVERTED_DIR, { recursive: true });
  }
}

export async function GET() {
  try {
    const conversions = await getFileConversions();
    return NextResponse.json(conversions);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la récupération des conversions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureConvertedDir();

    const formData = await request.formData();
    const type = formData.get('type') as ConversionType;
    const files = formData.getAll('files') as File[];
    const targetFormat = formData.get('targetFormat') as string | null;

    // html-to-pdf can work without files (URL or HTML content)
    if (!type || (files.length === 0 && type !== 'html-to-pdf')) {
      return NextResponse.json({ error: 'Type et fichiers requis' }, { status: 400 });
    }

    // Handle html-to-pdf separately (uses content/url, not file uploads)
    if (type === 'html-to-pdf') {
      const htmlContent = formData.get('htmlContent') as string | null;
      const url = formData.get('url') as string | null;

      if (!htmlContent && !url) {
        return NextResponse.json({ error: 'Contenu HTML ou URL requis' }, { status: 400 });
      }

      const isUrl = !!url;
      const content = isUrl ? url! : htmlContent!;
      const outputBuffer = await htmlToPdf(content, isUrl);

      const outputFilename = `${uuidv4()}.pdf`;
      const outputPath = path.join(CONVERTED_DIR, outputFilename);
      await fs.writeFile(outputPath, outputBuffer);

      const stat = await fs.stat(outputPath);
      const conversion = await createFileConversion({
        type,
        title: isUrl ? `URL vers PDF` : `HTML vers PDF`,
        inputFilenames: [isUrl ? url! : 'contenu-html'],
        outputFilename,
        outputFormat: 'pdf',
        fileSize: stat.size,
      });

      return NextResponse.json({
        success: true,
        conversion,
        downloadUrl: `/converted/${outputFilename}`,
      });
    }

    const fileBuffers: Buffer[] = [];
    const fileNames: string[] = [];
    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      fileBuffers.push(Buffer.from(arrayBuffer));
      fileNames.push(file.name);
    }

    // For multi-file output (pdf-to-images), handle separately
    if (type === 'pdf-to-images') {
      const images = await pdfToImages(fileBuffers[0]);
      const outputFilenames: string[] = [];
      const downloadUrls: string[] = [];

      for (let i = 0; i < images.length; i++) {
        const filename = `${uuidv4()}.png`;
        await fs.writeFile(path.join(CONVERTED_DIR, filename), images[i]);
        outputFilenames.push(filename);
        downloadUrls.push(`/converted/${filename}`);
      }

      // Also create a ZIP-like summary record
      const totalSize = images.reduce((sum, img) => sum + img.length, 0);
      const conversion = await createFileConversion({
        type,
        title: `PDF vers Images (${images.length} pages)`,
        inputFilenames: fileNames,
        outputFilename: outputFilenames[0],
        outputFormat: 'png',
        fileSize: totalSize,
      });

      return NextResponse.json({
        success: true,
        conversion,
        downloadUrls,
        multipleFiles: true,
      });
    }

    // Video-to-audio: extract audio track from video
    if (type === 'video-to-audio') {
      const audioFormat = (formData.get('audioFormat') as string) || 'mp3';
      const validFormats = ['mp3', 'wav', 'aac'];
      if (!validFormats.includes(audioFormat)) {
        return NextResponse.json({ error: 'Format audio invalide' }, { status: 400 });
      }

      const inputFilename = `input-${uuidv4()}${path.extname(fileNames[0]) || '.mp4'}`;
      const inputPath = path.join(CONVERTED_DIR, inputFilename);
      await fs.writeFile(inputPath, fileBuffers[0]);

      const outputFilename = `${uuidv4()}.${audioFormat}`;
      const outputPath = path.join(CONVERTED_DIR, outputFilename);

      try {
        await videoToAudio(inputPath, outputPath, audioFormat as 'mp3' | 'wav' | 'aac');
      } finally {
        try { await fs.unlink(inputPath); } catch {}
      }

      const stat = await fs.stat(outputPath);
      const conversion = await createFileConversion({
        type,
        title: `Vidéo vers ${audioFormat.toUpperCase()}`,
        inputFilenames: fileNames,
        outputFilename,
        outputFormat: audioFormat,
        fileSize: stat.size,
      });

      return NextResponse.json({
        success: true,
        conversion,
        downloadUrl: `/converted/${outputFilename}`,
      });
    }

    // Video resize/compress
    if (type === 'video-resize') {
      const resolution = (formData.get('resolution') as string) || '1280x720';
      const bitrate = (formData.get('bitrate') as string) || '2M';
      const fps = parseInt(formData.get('fps') as string) || 30;

      const inputFilename = `input-${uuidv4()}${path.extname(fileNames[0]) || '.mp4'}`;
      const inputPath = path.join(CONVERTED_DIR, inputFilename);
      await fs.writeFile(inputPath, fileBuffers[0]);

      const outputFilename = `${uuidv4()}.mp4`;
      const outputPath = path.join(CONVERTED_DIR, outputFilename);

      try {
        await resizeCompressVideo(inputPath, outputPath, { resolution, bitrate, fps });
      } finally {
        try { await fs.unlink(inputPath); } catch {}
      }

      const stat = await fs.stat(outputPath);
      const conversion = await createFileConversion({
        type,
        title: `Vidéo redimensionnée (${resolution}, ${bitrate})`,
        inputFilenames: fileNames,
        outputFilename,
        outputFormat: 'mp4',
        fileSize: stat.size,
      });

      return NextResponse.json({
        success: true,
        conversion,
        downloadUrl: `/converted/${outputFilename}`,
      });
    }

    // For video-to-gif, we need to save the input file to disk for FFmpeg
    if (type === 'video-to-gif') {
      const fps = parseInt(formData.get('fps') as string) || 10;
      const width = parseInt(formData.get('width') as string) || 480;
      const startTime = formData.get('startTime') ? parseFloat(formData.get('startTime') as string) : undefined;
      const duration = formData.get('duration') ? parseFloat(formData.get('duration') as string) : undefined;

      const inputFilename = `input-${uuidv4()}${path.extname(fileNames[0]) || '.mp4'}`;
      const inputPath = path.join(CONVERTED_DIR, inputFilename);
      await fs.writeFile(inputPath, fileBuffers[0]);

      const outputFilename = `${uuidv4()}.gif`;
      const outputPath = path.join(CONVERTED_DIR, outputFilename);

      try {
        await videoToGif(inputPath, outputPath, { fps, width, startTime, duration });
      } finally {
        try { await fs.unlink(inputPath); } catch {}
      }

      const stat = await fs.stat(outputPath);
      const conversion = await createFileConversion({
        type,
        title: `Vidéo vers GIF`,
        inputFilenames: fileNames,
        outputFilename,
        outputFormat: 'gif',
        fileSize: stat.size,
      });

      return NextResponse.json({
        success: true,
        conversion,
        downloadUrl: `/converted/${outputFilename}`,
      });
    }

    // Single-output conversions
    let outputBuffer: Buffer;
    let outputFormat: string;
    let title: string;

    switch (type) {
      case 'images-to-pdf': {
        outputBuffer = await convertImagesToPdf(fileBuffers);
        outputFormat = 'pdf';
        title = `Images vers PDF (${files.length} images)`;
        break;
      }
      case 'merge-pdfs': {
        outputBuffer = await mergePdfs(fileBuffers);
        outputFormat = 'pdf';
        title = `Fusion PDF (${files.length} fichiers)`;
        break;
      }
      case 'image-convert': {
        if (!targetFormat || !['png', 'jpeg', 'webp'].includes(targetFormat)) {
          return NextResponse.json({ error: 'Format cible invalide' }, { status: 400 });
        }
        outputBuffer = await convertImageFormat(fileBuffers[0], targetFormat as 'png' | 'jpeg' | 'webp');
        outputFormat = targetFormat === 'jpeg' ? 'jpg' : targetFormat;
        title = `Conversion image vers ${outputFormat.toUpperCase()}`;
        break;
      }
      case 'split-pdf': {
        const startPage = parseInt(formData.get('startPage') as string) || 1;
        const endPage = parseInt(formData.get('endPage') as string) || 1;
        outputBuffer = await splitPdf(fileBuffers[0], startPage, endPage);
        outputFormat = 'pdf';
        title = `PDF découpé (pages ${startPage}-${endPage})`;
        break;
      }
      case 'compress-image': {
        const quality = parseInt(formData.get('quality') as string) || 60;
        outputBuffer = await compressImage(fileBuffers[0], quality);
        const ext = path.extname(fileNames[0]).slice(1) || 'jpg';
        outputFormat = ext;
        title = `Image compressée (qualité ${quality}%)`;
        break;
      }
      default:
        return NextResponse.json({ error: 'Type de conversion non supporté' }, { status: 400 });
    }

    const outputFilename = `${uuidv4()}.${outputFormat}`;
    const outputPath = path.join(CONVERTED_DIR, outputFilename);
    await fs.writeFile(outputPath, outputBuffer);

    const stat = await fs.stat(outputPath);
    const conversion = await createFileConversion({
      type,
      title,
      inputFilenames: fileNames,
      outputFilename,
      outputFormat,
      fileSize: stat.size,
    });

    return NextResponse.json({
      success: true,
      conversion,
      downloadUrl: `/converted/${outputFilename}`,
    });
  } catch (error) {
    console.error('Erreur de conversion:', error);
    return NextResponse.json({ error: 'Erreur lors de la conversion' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID manquant' }, { status: 400 });
    }

    const conversions = await getFileConversions();
    const conversion = conversions.find(c => c.id === id);
    if (conversion) {
      const filePath = path.join(CONVERTED_DIR, conversion.outputFilename);
      try {
        await fs.unlink(filePath);
      } catch {
        // file may already be deleted
      }
    }

    const deleted = await deleteFileConversion(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Conversion non trouvée' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 });
  }
}
