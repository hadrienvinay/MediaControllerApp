'use client';

import { useState } from 'react';

export default function DeleteVideoButton({ videoId }: { videoId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette vidéo ?')) {
      return;
    }

    setIsDeleting(true);

    try {
        console.log('Tentative de suppression de la vidéo avec ID:', videoId);
      const response = await fetch(`/api/videos/${videoId}`, {
        method: 'DELETE',
      });
      console.log('Response status:', response.status);

      if (response.ok) {
        // Rafraîchir la page ou rediriger
        window.location.reload();
        // Ou avec Next.js router:
        // router.refresh();
      } else {
        alert('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression de la vidéo');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="px-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 cursor-pointer"
    >
      {isDeleting ? 'Suppression...' : 'X'}
    </button>
  );
}
