
import { notFound } from 'next/navigation';
import { getVideoProjectById } from '@/lib/video-storage';
import VideoForm from '@/app/components/VideoForm';

type Media = { title: string; source: string; file?: string | File; type?: string };

interface VideoProps {
  params: Promise<{ id: string }>
}

export default async function  UpdatePage({ params }: VideoProps) {
  const {id} = await params;
  const videoId = (id);
  const video = await getVideoProjectById(videoId);

  if (!video) {
    notFound()
  }

  return (
    <VideoForm initialData={{
      id: parseInt(videoId),
      name: video.name,
      description: video.description?? '',
      media: video.media.map((media) => ({
        title: media.title,
        type: media.type,
        source: media.source,
        filename: media.filename, // Les fichiers ne sont pas gérés dans ce contexte, ils doivent être réuploadés si nécessaire
      })),
    }} mode="edit" />
  );
}
