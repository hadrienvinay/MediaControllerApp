import { PDFDocument } from 'pdf-lib';
import sharp from 'sharp';
import * as QRCode from 'qrcode';
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
  toFormat: 'png' | 'jpeg' | 'webp' | 'ico'
): Promise<Buffer> {
  if (toFormat === 'ico') {
    // Resize to 256x256 (max ICO size) and convert to PNG, then wrap in ICO container
    const pngBuffer = await sharp(file)
      .resize(256, 256, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();

    // ICO file format: ICONDIR header + ICONDIRENTRY + PNG data
    const header = Buffer.alloc(6);
    header.writeUInt16LE(0, 0);      // Reserved
    header.writeUInt16LE(1, 2);      // Type: 1 = ICO
    header.writeUInt16LE(1, 4);      // Number of images

    const entry = Buffer.alloc(16);
    entry.writeUInt8(0, 0);          // Width: 0 = 256
    entry.writeUInt8(0, 1);          // Height: 0 = 256
    entry.writeUInt8(0, 2);          // Color palette
    entry.writeUInt8(0, 3);          // Reserved
    entry.writeUInt16LE(1, 4);       // Color planes
    entry.writeUInt16LE(32, 6);      // Bits per pixel
    entry.writeUInt32LE(pngBuffer.length, 8);  // Image size
    entry.writeUInt32LE(22, 12);     // Offset (6 + 16 = 22)

    return Buffer.concat([header, entry, pngBuffer]);
  }
  return sharp(file).toFormat(toFormat).toBuffer();
}

export async function pdfToImages(file: Buffer): Promise<Buffer[]> {
  const mupdf = await import('mupdf');
  const doc = mupdf.Document.openDocument(file, 'application/pdf');
  const pageCount = doc.countPages();
  const images: Buffer[] = [];

  for (let i = 0; i < pageCount; i++) {
    const page = doc.loadPage(i);
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
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
  });
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

export async function trimAudio(
  inputPath: string,
  outputPath: string,
  startTime: number,
  endTime: number
): Promise<void> {
  const duration = endTime - startTime;
  await execAsync(
    `ffmpeg -i "${inputPath}" -ss ${startTime} -t ${duration} -c copy -avoid_negative_ts 1 -y "${outputPath}"`,
    { maxBuffer: 50 * 1024 * 1024 }
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

export async function isolateVoice(inputPath: string, outputPath: string): Promise<void> {
  const tmpDir = path.join(path.dirname(outputPath), `demucs-${uuidv4()}`);
  // Use a clean UUID filename so demucs doesn't fail on special characters
  const safeInputName = uuidv4();
  const inputExt = path.extname(inputPath);
  const safeInputPath = path.join(tmpDir, `${safeInputName}${inputExt}`);

  try {
    await fs.mkdir(tmpDir, { recursive: true });
    await fs.copyFile(inputPath, safeInputPath);

    await execAsync(
      `python3 -m demucs --two-stems=vocals --mp3 --mp3-bitrate 192 -o "${tmpDir}" "${safeInputPath}"`,
      { maxBuffer: 200 * 1024 * 1024, timeout: 900000 }
    );

    const vocalsPath = path.join(tmpDir, 'htdemucs', safeInputName, 'vocals.mp3');
    await fs.copyFile(vocalsPath, outputPath);
  } catch (err: unknown) {
    const msg = (err as Error & { stderr?: string }).stderr || (err as Error).message || '';
    if (msg.includes('No module named demucs') || msg.includes('demucs')) {
      throw new Error('Demucs non installé. Installez-le avec: pip install demucs');
    }
    throw err;
  } finally {
    try { await fs.rm(tmpDir, { recursive: true, force: true }); } catch {}
  }
}

export async function signPdf(
  pdfBuffer: Buffer,
  signatureBuffer: Buffer,
  pageNumber: number,
  x: number,
  y: number,
  widthPercent: number
): Promise<Buffer> {
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  const page = pdfDoc.getPage(pageNumber - 1);
  const { width: pageWidth, height: pageHeight } = page.getSize();

  const metadata = await sharp(signatureBuffer).metadata();
  const sigAspect = (metadata.height ?? 100) / (metadata.width ?? 100);

  let sigPng = signatureBuffer;
  if (metadata.format !== 'png') {
    sigPng = await sharp(signatureBuffer).png().toBuffer();
  }

  const sigImage = await pdfDoc.embedPng(sigPng);
  const sigWidthPdf = widthPercent * pageWidth;
  const sigHeightPdf = sigWidthPdf * sigAspect;
  const pdfX = x * pageWidth;
  // PDF y-axis is from bottom; y param is from top
  const pdfY = pageHeight - (y * pageHeight) - sigHeightPdf;

  page.drawImage(sigImage, { x: pdfX, y: pdfY, width: sigWidthPdf, height: sigHeightPdf });

  return Buffer.from(await pdfDoc.save());
}

export async function generateQRCode(
  text: string,
  format: 'png' | 'svg' = 'png'
): Promise<Buffer> {
  if (format === 'svg') {
    const svg = await QRCode.toString(text, { type: 'svg', width: 300 });
    return Buffer.from(svg);
  }
  return QRCode.toBuffer(text, { width: 300, margin: 2, color: { dark: '#000000', light: '#ffffff' } });
}
