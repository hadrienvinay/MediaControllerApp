import { promises as fs } from 'fs';
import path from 'path';
import { VideoProject } from '@/types/video';

const DATA_DIR = path.join(process.cwd(), 'data');
const VIDEOS_FILE = path.join(DATA_DIR, 'video-projects.json');

async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

export async function getVideoProjects(): Promise<VideoProject[]> {
  await ensureDataDir();
  try {
    const data = await fs.readFile(VIDEOS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export async function saveVideoProjects(projects: VideoProject[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(VIDEOS_FILE, JSON.stringify(projects, null, 2));
}

export async function getVideoProjectById(id: string): Promise<VideoProject | null> {
  const projects = await getVideoProjects();
  return projects.find(p => p.id === id) || null;
}

export async function createVideoProject(
  project: Omit<VideoProject, 'id' | 'createdAt' | 'updatedAt'>
): Promise<VideoProject> {
  const projects = await getVideoProjects();
  const newProject: VideoProject = {
    ...project,
    id: Date.now().toString(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  console.log('Création de projet vidéo:', newProject);
  projects.push(newProject);
  await saveVideoProjects(projects);
  return newProject;
}

export async function updateVideoProject(
  id: string,
  updates: Partial<VideoProject>
): Promise<VideoProject | null> {
  const projects = await getVideoProjects();
  const index = projects.findIndex(p => p.id === id);
  if (index === -1) return null;

  projects[index] = {
    ...projects[index],
    ...updates,
    updatedAt: new Date(),
  };
  await saveVideoProjects(projects);
  return projects[index];
}

export async function deleteVideoProject(id: string): Promise<boolean> {
  const projects = await getVideoProjects();
  const filtered = projects.filter(p => p.id !== id);
  if (filtered.length === projects.length) return false;
  await saveVideoProjects(filtered);
  return true;
}
