
import { promises as fs } from 'fs';
import path from 'path';
import { ConvertedItem } from '@/types/converted';

const DATA_DIR = path.join(process.cwd(), 'data');
const CONVERTED_FILE = path.join(DATA_DIR, 'converted.json');

async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

export async function getConvertedFiles(): Promise<ConvertedItem[]> {
  await ensureDataDir();
  try {
    const data = await fs.readFile(CONVERTED_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export async function saveConvertedFiles(converted: ConvertedItem[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(CONVERTED_FILE, JSON.stringify(converted, null, 2));
}

export async function getConvertedFilebyId(id: string): Promise<ConvertedItem | null> {
  const convertedFiles = await getConvertedFiles();
  return convertedFiles.find(p => p.id === id) || null;
}

export async function createConvertedFile(ConvertedFile: Omit<ConvertedItem, 'id' | 'createdAt'>): Promise<ConvertedItem> {
  const ConvertedFiles = await getConvertedFiles();
  const newConvertedFile: ConvertedItem = {
    ...ConvertedFile,
    id: Date.now().toString(),
    createdAt: new Date(),
  };
  ConvertedFiles.push(newConvertedFile);
  await saveConvertedFiles(ConvertedFiles);
  return newConvertedFile;
}

export async function deleteConvertedFile(id: string): Promise<boolean> {
  const ConvertedFiles = await getConvertedFiles();
  const filtered = ConvertedFiles.filter(p => p.id !== id);
  if (filtered.length === ConvertedFiles.length) return false;
  await saveConvertedFiles(filtered);
  return true;
}
