import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function YoutubeToMp3Form() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const router = useRouter();

   const handleSubmit = async (e: React.FormEvent) => {
    console.log('URL soumise pour conversion:',e);

    e.preventDefault();
    setIsSubmitting(true);
    const url = youtubeUrl;  
    try {
      const response = await fetch('/api/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }), // Envoyer l'URL dans le corps de la requête
      });   
        if (!response.ok) {
            const error = await response.json();
            alert(`Error: ${error.error}`);
        } else {
            //alert('Conversion successful! Check your downloads folder.');
            const data = await response.json();
            console.log('Data received from conversion API:', data);
            const metadata = data.metadata;
            router.push(`${data.responseUrl}&metadata=${encodeURIComponent(JSON.stringify(metadata))}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred during conversion');
    } finally {
        setIsSubmitting(false);
    }
}
  return (
    <div>
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <input type="url" id="url" name="url" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder="Enter YouTube or SoundCloud URL" className="text-black mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" required />
            </div>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-black rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                {isSubmitting ?'Conversion...' :'Convertir en format MP3'}
            </button>
        </form>
    </div>
  );
}