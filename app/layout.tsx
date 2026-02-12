import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Music Mixer - Créez vos playlists et vidéos',
  description: 'Créez et gérez vos playlists audio et projets vidéo avec transitions professionnelles',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased">
        <nav className="bg-gray-900 text-white p-4 shadow-lg">
          <div className="container mx-auto flex justify-between items-center">
            <a href="/" className="text-2xl font-bold hover:bg-purple-500 p-2 rounded" >🎵 Music Mixer</a>
            <div className="space-x-4">
              <a href="/playlists" className="hover:text-gray-300">🎵 Playlists</a>
              <a href="/videos" className="hover:text-gray-300">🎬 Vidéos</a>
              <a href="playlists/create" className="hover:text-gray-300">+ Audio</a>
              <a href="/videos/create" className="hover:text-gray-300">+ Vidéo</a>
            </div>
          </div>
        </nav>
        <main className="container mx-auto p-6">
          {children}
        </main>
      </body>
    </html>
  );
}
