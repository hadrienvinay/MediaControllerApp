'use client';

import { useSearchParams } from 'next/navigation';

export default function ConverterPage() {
    const searchParams = useSearchParams();
    const audioFile = searchParams.get('file');
    const metadata = searchParams.get('metadata') ;
    console.log('Metadata reçue dans ConverterPage (raw):', metadata);
    const parsedMetadata = metadata ? JSON.parse(metadata) : null;
    console.log('Metadata reçue dans ConverterPage (parsed):', parsedMetadata);
    const title = parsedMetadata?.title || 'Fichier Converti';
    const author = parsedMetadata?.author || 'Inconnu';
    const duration = parsedMetadata?.duration || '';
    const thumbnail = parsedMetadata?.thumbnail || '';
    console.log('Metadata reçue dans ConverterPage:', title, author);
    const audioPath = `/audio/converted/${audioFile}`;
  return ( 
    <div className="space-y-12">
      <div className="bg-purple-900 rounded-xl p-6 shadow-lg">
        <div className="relative">
            <div aria-hidden="true" className="hidden sm:block">
                <div className="absolute inset-y-0 left-0 w-1/2 bg-purple-800 rounded-r-3xl">
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
              <div className="relative rounded-2xl px-6 py-10 bg-purple-700 overflow-hidden shadow-xl sm:px-12 sm:py-20">
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
                          <h1 className="text-5xl font-bold text-center mb-8">Votre fichier a bien été converti !</h1>
                          <div className="mb-4">
                            <img src={thumbnail} alt="Thumbnail" className="mx-auto rounded-lg shadow-lg mb-4" width={400}/>
                            <h2 className="text-xl text-center text-gray-100">{title} - {duration}</h2>
                          </div>
                                              </div>
                      <div className="sm:mx-auto sm:flex sm:justify-center space-x-6">
                      <a href={audioPath} download={audioFile} className="w-auto inline-block mt-5 mx-auto rounded-md border border-transparent px-5 py-3 bg-green-900 text-base font-medium text-white shadow hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-rose-500 sm:px-10">
                          Télécharger le MP3 converti →
                      </a>
                      <a href="/"
                          className="w-auto inline-block mt-5 mx-auto rounded-md border border-transparent px-5 py-3 bg-purple-900 text-base font-medium text-white shadow hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-rose-500 sm:px-10">
                          Convertir une Nouvelle Vidéo →
                      </a>
                      </div>
                  </div>
              </div>
            </div>
          </div>
        </div>
    </div>
  )
}