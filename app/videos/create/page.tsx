'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import VideoForm from '@/app/components/VideoForm';

export default function CreateVideoPage() {

  return (
      <VideoForm mode='create'/>
  );
}
