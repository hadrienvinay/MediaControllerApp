'use client';

import PlaylistForm from '@/app/components/PlaylistForm';

type Track = { title: string; source: string; file?: File; url?: string };

export default function CreatePage() {

  return (
    <PlaylistForm mode="create" />
  );
}
