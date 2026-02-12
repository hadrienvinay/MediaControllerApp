'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Playlist } from '@/types/playlist';
import PlaylistsPage from './playlists/page';
import VideosPage from './videos/page';
import ConverterPage from './converter/page';

import YoutubeToMp3Form from './components/YoutubeToMp3Form';

export default function Home() {

  return ( 
    <div className="space-y-12">
      <div className="bg-gray-900 rounded-xl p-6 shadow-lg">
        <div className="relative">
            <div aria-hidden="true" className="hidden sm:block">
                <div className="absolute inset-y-0 left-0 w-1/2 bg-gray-800 rounded-r-3xl">
                </div>
                <svg className="absolute top-8 left-1/2 -ml-3" width="404" height="392" fill="none" viewBox="0 0 404 392">
                    <defs>
                        <pattern id="8228f071-bcee-4ec8-905a-2a059a2cc4fb" x="0" y="0" width="20" height="20"
                            patternUnits="userSpaceOnUse">
                            <rect x="0" y="0" width="4" height="4" className="text-gray-200" fill="currentColor"></rect>
                        </pattern>
                    </defs>
                    <rect width="404" height="392" fill="url(#8228f071-bcee-4ec8-905a-2a059a2cc4fb)"></rect>
                </svg>
            </div>
            <div className="mx-auto max-w-md px-4 sm:max-w-3xl sm:px-6 lg:max-w-7xl lg:px-8">
              <div className="relative rounded-2xl px-6 py-10 bg-gray-700 overflow-hidden shadow-xl sm:px-12 sm:py-20">
                  <div aria-hidden="true" className="absolute inset-0 -mt-72 sm:-mt-32 md:mt-0"><svg
                          className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice"
                          xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 1463 360">
                          <path className="text-gray-600 text-opacity-40" fill="currentColor"
                              d="M-82.673 72l1761.849 472.086-134.327 501.315-1761.85-472.086z"></path>
                          <path className="text-gray-800 text-opacity-40" fill="currentColor"
                              d="M-217.088 544.086L1544.761 72l134.327 501.316-1761.849 472.086z"></path>
                      </svg>
                  </div>
                  <div className="relative flex flex-col">
                      <div className="sm:text-center">
                          <h1 className="text-5xl font-bold text-center mb-12">Bienvenue sur MyApp Mixer</h1>
                        
                          <p className="mt-6 mx-auto max-w-2xl text-lg text-gray-100"> Faites vos montages vidéo et créer vos playlists !</p>
                      </div>
                      <div className="sm:mx-auto sm:flex sm:justify-center space-x-6">
                      <a href="/playlists/create"
                          className="w-auto inline-block mt-5 mx-auto rounded-md border border-transparent px-5 py-3 bg-green-900 text-base font-medium text-white shadow hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-rose-500 sm:px-10">
                          Nouvelle Playlist →
                      </a>
                      <a href="/videos/create"
                          className="w-auto inline-block mt-5 mx-auto rounded-md border border-transparent px-5 py-3 bg-purple-900 text-base font-medium text-white shadow hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-rose-500 sm:px-10">
                          Nouvelle Vidéo →
                      </a>
                      </div>
                  </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-orange-500 text-white -skew-y-1">
        <div className="container mx-auto skew-y-1">
            <div className="flex flex-col items-center py-10 text-center lg:py-20">
                <div className="w-full px-4 lg:w-1/2 lg:px-0">
                    <div className="mb-8">
                        <h2 className="text-3xl lg:text-4xl font-bold mb-3">
                            Youtube/ Soudcloud to MP3+
                        </h2>
                        <p className="text-lg text-gray-100">
                            Importez vos titres préférés depuis YouTube ou Soundcloud, et laissez MyApp Mixer les transformer en fichiers MP3 de haute qualité, prêts à être intégrés dans vos playlists ou projets vidéo.
                        </p>
                    </div>

                    <div className="">
                        <div className="relative">
                            <YoutubeToMp3Form />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <ConverterPage />

    <PlaylistsPage />
    
    <VideosPage />  

    </div>
 );
}
