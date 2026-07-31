import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const URLS_FILE = path.join(DATA_DIR, 'urls.json');

interface ShortUrl {
  code: string;
  url: string;
  createdAt: string;
  clicks: number;
}

async function ensureDataDir() {
  try { await fs.access(DATA_DIR); } catch { await fs.mkdir(DATA_DIR, { recursive: true }); }
}

async function readUrls(): Promise<ShortUrl[]> {
  await ensureDataDir();
  try { return JSON.parse(await fs.readFile(URLS_FILE, 'utf-8')); } catch { return []; }
}

async function writeUrls(urls: ShortUrl[]) {
  await ensureDataDir();
  await fs.writeFile(URLS_FILE, JSON.stringify(urls, null, 2));
}

function randomCode(len = 6): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export async function createShortUrl(url: string): Promise<ShortUrl> {
  const urls = await readUrls();
  const existing = urls.find(u => u.url === url);
  if (existing) return existing;
  let code: string;
  do { code = randomCode(); } while (urls.some(u => u.code === code));
  const entry: ShortUrl = { code, url, createdAt: new Date().toISOString(), clicks: 0 };
  urls.push(entry);
  await writeUrls(urls);
  return entry;
}

export async function resolveShortUrl(code: string): Promise<ShortUrl | null> {
  const urls = await readUrls();
  const entry = urls.find(u => u.code === code);
  if (!entry) return null;
  entry.clicks++;
  await writeUrls(urls);
  return entry;
}

export async function getAllShortUrls(): Promise<ShortUrl[]> {
  return readUrls();
}

export async function deleteShortUrl(code: string): Promise<boolean> {
  const urls = await readUrls();
  const filtered = urls.filter(u => u.code !== code);
  if (filtered.length === urls.length) return false;
  await writeUrls(filtered);
  return true;
}
