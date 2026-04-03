import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function YoutubeToMp3Form() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [format, setFormat] = useState<'mp3' | 'mp4'>('mp3');
  const router = useRouter();

  const isYoutubeUrl = /youtube\.com|youtu\.be/i.test(youtubeUrl);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: youtubeUrl, format }),
      });
      if (!response.ok) {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      } else {
        const data = await response.json();
        const metadata = data.metadata;
        router.push(`${data.responseUrl}&metadata=${encodeURIComponent(JSON.stringify(metadata))}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred during conversion');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="url"
            id="url"
            name="url"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="Enter YouTube or SoundCloud URL"
            className="text-black mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            required
          />
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="format"
              value="mp3"
              checked={format === 'mp3'}
              onChange={() => setFormat('mp3')}
              className="accent-blue-500"
            />
            <span className="text-sm font-medium">MP3 (audio)</span>
          </label>
          <label className={`flex items-center gap-2 ${isYoutubeUrl ? 'cursor-pointer' : 'cursor-not-allowed opacity-40'}`}>
            <input
              type="radio"
              name="format"
              value="mp4"
              checked={format === 'mp4'}
              onChange={() => setFormat('mp4')}
              disabled={!isYoutubeUrl}
              className="accent-blue-500"
            />
            <span className="text-sm font-medium">
              MP4 (vidéo)
              {!isYoutubeUrl && youtubeUrl.length > 0 && (
                <span className="text-xs text-gray-400 ml-1">— YouTube uniquement</span>
              )}
            </span>
          </label>
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {isSubmitting
            ? 'Conversion...'
            : format === 'mp4'
              ? 'Convertir en MP4 (vidéo)'
              : 'Convertir en MP3 (audio)'}
        </button>
      </form>
    </div>
  );
}
