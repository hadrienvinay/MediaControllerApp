import { promises as fs } from 'fs';
import path from 'path';
import { FileConversion } from '@/types/file-conversion';

const DATA_DIR = path.join(process.cwd(), 'data');
const FILE_CONVERSIONS_FILE = path.join(DATA_DIR, 'file-conversions.json');

async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

export async function getFileConversions(): Promise<FileConversion[]> {
  await ensureDataDir();
  try {
    const data = await fs.readFile(FILE_CONVERSIONS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export async function saveFileConversions(conversions: FileConversion[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(FILE_CONVERSIONS_FILE, JSON.stringify(conversions, null, 2));
}

export async function createFileConversion(
  conversion: Omit<FileConversion, 'id' | 'createdAt'>
): Promise<FileConversion> {
  const conversions = await getFileConversions();
  const newConversion: FileConversion = {
    ...conversion,
    id: Date.now().toString(),
    createdAt: new Date(),
  };
  conversions.push(newConversion);
  await saveFileConversions(conversions);
  return newConversion;
}

export async function deleteFileConversion(id: string): Promise<boolean> {
  const conversions = await getFileConversions();
  const filtered = conversions.filter(c => c.id !== id);
  if (filtered.length === conversions.length) return false;
  await saveFileConversions(filtered);
  return true;
}
