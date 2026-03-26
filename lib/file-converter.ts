import { PDFDocument } from 'pdf-lib';
import sharp from 'sharp';
import * as mupdf from 'mupdf';
import puppeteer from 'puppeteer';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { promises as fs } from 'fs';
import { v4 as uuidv4 } from 'uuid';

const execAsync = promisify(exec);

export async function convertImagesToPdf(
  files: Buffer[]
): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();

  for (let i = 0; i < files.length; i++) {
    const metadata = await sharp(files[i]).metadata();
    let imageBuffer = files[i];
    let format = metadata.format;

    // pdf-lib only supports jpg and png — convert webp/other to png
    if (format !== 'jpeg' && format !== 'png') {
      imageBuffer = await sharp(files[i]).png().toBuffer();
      format = 'png';
    }

    const image =
      format === 'jpeg'
        ? await pdfDoc.embedJpg(imageBuffer)
        : await pdfDoc.embedPng(imageBuffer);

    const width = metadata.width || 595;
    const height = metadata.height || 842;

    const page = pdfDoc.addPage([width, height]);
    page.drawImage(image, { x: 0, y: 0, width, height });
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

export async function mergePdfs(files: Buffer[]): Promise<Buffer> {
  const mergedDoc = await PDFDocument.create();

  for (const file of files) {
    const srcDoc = await PDFDocument.load(file);
    const pages = await mergedDoc.copyPages(srcDoc, srcDoc.getPageIndices());
    for (const page of pages) {
      mergedDoc.addPage(page);
    }
  }

  const pdfBytes = await mergedDoc.save();
  return Buffer.from(pdfBytes);
}

export async function convertImageFormat(
  file: Buffer,
  toFormat: 'png' | 'jpeg' | 'webp'
): Promise<Buffer> {
  return sharp(file).toFormat(toFormat).toBuffer();
}

export async function pdfToImages(file: Buffer): Promise<Buffer[]> {
  const doc = mupdf.Document.openDocument(file, 'application/pdf');
  const pageCount = doc.countPages();
  const images: Buffer[] = [];

  for (let i = 0; i < pageCount; i++) {
    const page = doc.loadPage(i);
    // Render at 2x scale for good quality (144 DPI)
    const pixmap = page.toPixmap(mupdf.Matrix.scale(2, 2), mupdf.ColorSpace.DeviceRGB, false, true);
    const pngData = pixmap.asPNG();
    images.push(Buffer.from(pngData));
  }

  return images;
}

export async function splitPdf(
  file: Buffer,
  startPage: number,
  endPage: number
): Promise<Buffer> {
  const srcDoc = await PDFDocument.load(file);
  const totalPages = srcDoc.getPageCount();

  const start = Math.max(0, startPage - 1); // convert to 0-indexed
  const end = Math.min(totalPages - 1, endPage - 1);

  const newDoc = await PDFDocument.create();
  const pageIndices = [];
  for (let i = start; i <= end; i++) {
    pageIndices.push(i);
  }

  const pages = await newDoc.copyPages(srcDoc, pageIndices);
  for (const page of pages) {
    newDoc.addPage(page);
  }

  const pdfBytes = await newDoc.save();
  return Buffer.from(pdfBytes);
}

export async function compressImage(
  file: Buffer,
  quality: number
): Promise<Buffer> {
  const metadata = await sharp(file).metadata();
  const format = metadata.format || 'jpeg';

  let pipeline = sharp(file);

  if (format === 'jpeg' || format === 'jpg') {
    pipeline = pipeline.jpeg({ quality, mozjpeg: true });
  } else if (format === 'png') {
    pipeline = pipeline.png({ quality, compressionLevel: 9 });
  } else if (format === 'webp') {
    pipeline = pipeline.webp({ quality });
  } else {
    // Fallback: convert to jpeg with compression
    pipeline = pipeline.jpeg({ quality, mozjpeg: true });
  }

  return pipeline.toBuffer();
}

export async function videoToGif(
  inputPath: string,
  outputPath: string,
  options: { fps?: number; width?: number; startTime?: number; duration?: number } = {}
): Promise<void> {
  const { fps = 10, width = 480, startTime, duration } = options;

  let timeArgs = '';
  if (startTime !== undefined) timeArgs += ` -ss ${startTime}`;
  if (duration !== undefined) timeArgs += ` -t ${duration}`;

  // Two-pass approach for better quality GIF
  const paletteDir = path.join(process.cwd(), 'public', 'converted');
  const palettePath = path.join(paletteDir, `palette-${uuidv4()}.png`);

  try {
    // Pass 1: Generate palette
    await execAsync(
      `ffmpeg${timeArgs} -i "${inputPath}" -vf "fps=${fps},scale=${width}:-1:flags=lanczos,palettegen" -y "${palettePath}"`
    );

    // Pass 2: Generate GIF using palette
    await execAsync(
      `ffmpeg${timeArgs} -i "${inputPath}" -i "${palettePath}" -lavfi "fps=${fps},scale=${width}:-1:flags=lanczos [x]; [x][1:v] paletteuse" -y "${outputPath}"`
    );
  } finally {
    // Clean up palette
    try { await fs.unlink(palettePath); } catch {}
  }
}

export async function htmlToPdf(
  content: string,
  isUrl: boolean
): Promise<Buffer> {
  const browser = await puppeteer.launch({ headless: true });
  try {
    const page = await browser.newPage();

    if (isUrl) {
      await page.goto(content, { waitUntil: 'networkidle2', timeout: 30000 });
    } else {
      await page.setContent(content, { waitUntil: 'networkidle0' });
    }

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}

export async function videoToAudio(
  inputPath: string,
  outputPath: string,
  format: 'mp3' | 'wav' | 'aac' = 'mp3'
): Promise<void> {
  const codecMap: Record<string, string> = {
    mp3: 'libmp3lame',
    wav: 'pcm_s16le',
    aac: 'aac',
  };
  const codec = codecMap[format] || 'libmp3lame';

  await execAsync(
    `ffmpeg -i "${inputPath}" -vn -acodec ${codec} -q:a 2 -y "${outputPath}"`
  );
}

export async function resizeCompressVideo(
  inputPath: string,
  outputPath: string,
  options: { resolution?: string; bitrate?: string; fps?: number } = {}
): Promise<void> {
  const { resolution = '1280x720', bitrate = '2M', fps = 30 } = options;
  const [width, height] = resolution.split('x');

  await execAsync(
    `ffmpeg -i "${inputPath}" -vf "scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2" -b:v ${bitrate} -r ${fps} -c:v libx264 -preset medium -c:a aac -b:a 128k -y "${outputPath}"`,
    { maxBuffer: 50 * 1024 * 1024 }
  );
}
