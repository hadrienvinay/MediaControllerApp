export type ConversionType =
  | 'images-to-pdf'
  | 'merge-pdfs'
  | 'image-convert'
  | 'pdf-to-images'
  | 'split-pdf'
  | 'compress-image'
  | 'video-to-gif'
  | 'html-to-pdf'
  | 'video-to-audio'
  | 'video-resize'
  | 'audio-trim'
  | 'qr-code'
  | 'sign-pdf'
  | 'voice-isolate'
  | 'compress-pdf';

export interface FileConversion {
  id: string;
  type: ConversionType;
  title: string;
  inputFilenames: string[];
  outputFilename: string;
  outputFormat: string;
  fileSize?: number;
  createdAt: Date;
}
