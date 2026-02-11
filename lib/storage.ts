import { promises as fs } from 'fs';
import path from 'path';
import { Playlist } from '@/types/playlist';

const DATA_DIR = path.join(process.cwd(), 'data');
const PLAYLISTS_FILE = path.join(DATA_DIR, 'playlists.json');

async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

export async function getPlaylists(): Promise<Playlist[]> {
  await ensureDataDir();
  try {
    const data = await fs.readFile(PLAYLISTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export async function getPlaylistById(id: string): Promise<Playlist | null> {
  const playlists = await getPlaylists();
  return playlists.find(p => p.id === id) || null;
}

export async function savePlaylists(playlists: Playlist[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(PLAYLISTS_FILE, JSON.stringify(playlists, null, 2));
}

export async function createPlaylist(playlist: Omit<Playlist, 'id' | 'createdAt' | 'updatedAt'>): Promise<Playlist> {
  const playlists = await getPlaylists();
  const newPlaylist: Playlist = {
    ...playlist,
    id: Date.now().toString(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  playlists.push(newPlaylist);
  await savePlaylists(playlists);
  return newPlaylist;
}

export async function updatePlaylist(id: string, update: Playlist): Promise<Playlist | null> {
  const playlists = await getPlaylists();
  const index = playlists.findIndex(p => p.id === id);
  if (index === -1) return null;
  playlists[index] = {
    ...playlists[index],
    ...update,
    updatedAt: new Date(),
  };
  await savePlaylists(playlists);
  return playlists[index];
}

export async function deletePlaylist(id: string): Promise<boolean> {
  const playlists = await getPlaylists();
  const filtered = playlists.filter(p => p.id !== id);
  if (filtered.length === playlists.length) return false;
  await savePlaylists(filtered);
  return true;
}
