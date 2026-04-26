'use client';

import Link from 'next/link';
import YoutubeToMp3Form from './components/YoutubeToMp3Form';
import ConverterPage from './converter/page';
import PlaylistsPage from './playlists/page';
import VideosPage from './videos/page';

export default function Home() {
  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 blur-3xl" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-l from-blue-500/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-transparent rounded-full blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="text-center space-y-6">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Media Controller
            </h1>
            <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Convertissez, éditez et transformez vos médias. Audio, vidéo, images, QR codes et bien plus.
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-3 justify-center pt-4">
              {['Convertisseur universel', 'Édition audio/vidéo', 'Générateur QR', 'Sans limites'].map((feature) => (
                <span
                  key={feature}
                  className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 text-blue-200 text-sm font-medium"
                >
                  ✨ {feature}
                </span>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Link
                href="/playlists/create"
                className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl font-semibold text-white shadow-lg hover:shadow-blue-600/50 hover:shadow-2xl transition-all hover:scale-105 active:scale-95"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl opacity-0 group-hover:opacity-50 blur transition" />
                <span className="relative flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 3a2 2 0 00-2 2v2c0 .713.31 1.38.81 1.834A1 1 0 003 9h14a1 1 0 00.19-.166C16.69 8.38 17 7.713 17 7V5a2 2 0 00-2-2H5z" />
                    <path fillRule="evenodd" d="M3 9h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V9zm5.5 3a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm5 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" clipRule="evenodd" />
                  </svg>
                  Créer une playlist
                </span>
              </Link>
              <Link
                href="/videos/create"
                className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold text-white shadow-lg hover:shadow-purple-600/50 hover:shadow-2xl transition-all hover:scale-105 active:scale-95"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-500 rounded-xl opacity-0 group-hover:opacity-50 blur transition" />
                <span className="relative flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
                  </svg>
                  Créer un montage
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* YouTube to MP3/MP4 Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/10 to-red-600/10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-l from-orange-500/15 to-transparent rounded-full blur-3xl" />

        <div className="relative mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-orange-500/30 overflow-hidden backdrop-blur">
            <div className="px-6 py-12 sm:px-12">
              <div className="flex items-center gap-3 mb-4">
                <svg className="w-8 h-8 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm4 2v4h8V8H6z" />
                </svg>
                <h2 className="text-3xl font-bold text-orange-400">YouTube & SoundCloud Download</h2>
              </div>

              <p className="text-gray-300 text-lg mb-8 max-w-2xl">
                Téléchargez vos vidéos et musiques préférées directement depuis YouTube ou SoundCloud, en MP3 ou MP4.
              </p>

              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                <YoutubeToMp3Form />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
            Outils puissants
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Transformez vos fichiers avec des outils modernes et intuitifs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: '🎵', title: 'Audio', desc: 'Convertir, découper, mixer' },
            { icon: '🎬', title: 'Vidéo', desc: 'Redimensionner, créer des GIFs' },
            { icon: '📄', title: 'PDF', desc: 'Fusionner, découper, convertir' },
            { icon: '🖼️', title: 'Images', desc: 'Convertir, compresser, redimensionner' },
            { icon: '📱', title: 'QR Codes', desc: 'Générer et télécharger' },
            { icon: '🌐', title: 'Web', desc: 'HTML/URL vers PDF' },
          ].map((feature, idx) => (
            <div
              key={idx}
              className="group rounded-xl bg-gradient-to-br from-gray-800/40 to-gray-900/40 border border-gray-700/50 p-6 hover:border-blue-500/50 hover:bg-gradient-to-br hover:from-gray-800/60 hover:to-gray-900/60 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Converter Tools */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ConverterPage />
      </section>

      {/* Playlists Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <PlaylistsPage />
      </section>

      {/* Videos Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <VideosPage />
      </section>
    </div>
  );
}
