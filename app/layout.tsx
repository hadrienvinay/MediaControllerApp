import type { Metadata } from 'next';
import "./globals.css";

export const metadata: Metadata = {
  title: 'Media Controller - Convertisseur universel',
  description: 'Convertissez, éditez et transformez vos médias. Audio, vidéo, images, PDF, QR codes et bien plus.',
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased bg-gray-950">
        {/* Navbar */}
        <nav className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-xl border-b border-gray-800/50 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <a
                href="/"
                className="group flex items-center gap-3 text-2xl font-bold hover:opacity-80 transition-opacity"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition" />
                  <div className="relative bg-gray-900 rounded-lg px-3 py-2">
                    <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">MC</span>
                  </div>
                </div>
                <span className="hidden sm:block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Media Controller
                </span>
              </a>

              {/* Main Navigation */}
              <div className="hidden md:flex items-center space-x-1">
                <a
                  href="/playlists"
                  className="group px-4 py-2 rounded-lg text-gray-300 hover:text-white transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-600/20 hover:to-purple-600/20 border border-transparent hover:border-blue-500/50"
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5 3a2 2 0 00-2 2v2c0 .713.31 1.38.81 1.834A1 1 0 003 9h14a1 1 0 00.19-.166C16.69 8.38 17 7.713 17 7V5a2 2 0 00-2-2H5z" />
                      <path fillRule="evenodd" d="M3 9h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V9zm5.5 3a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm5 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" clipRule="evenodd" />
                    </svg>
                    Playlists
                  </span>
                </a>
                <a
                  href="/videos"
                  className="group px-4 py-2 rounded-lg text-gray-300 hover:text-white transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-600/20 hover:to-purple-600/20 border border-transparent hover:border-blue-500/50"
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm4 2v4h8V8H6z" />
                    </svg>
                    Vidéos
                  </span>
                </a>
                <a
                  href="/converter"
                  className="group px-4 py-2 rounded-lg text-gray-300 hover:text-white transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-600/20 hover:to-purple-600/20 border border-transparent hover:border-blue-500/50"
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 5.199V3a1 1 0 01-1-1zm.008 9a1 1 0 011.992 0 5 5 0 009.99 0 1 1 0 011.999 0 7 7 0 11-13.981 0z" clipRule="evenodd" />
                    </svg>
                    Convertisseur
                  </span>
                </a>
              </div>

              {/* Quick Action Buttons */}
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="hidden sm:flex gap-2">
                  <a
                    href="/playlists/create"
                    className="group relative px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg text-sm font-semibold text-white hover:shadow-lg hover:shadow-blue-600/50 transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Audio
                  </a>
                  <a
                    href="/videos/create"
                    className="group relative px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-sm font-semibold text-white hover:shadow-lg hover:shadow-purple-600/50 transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Vidéo
                  </a>
                </div>

                {/* Mobile Menu Button */}
                <div className="md:hidden">
                  <details className="group">
                    <summary className="list-none cursor-pointer p-2 hover:bg-gray-800 rounded-lg transition">
                      <svg
                        className="w-6 h-6 group-open:hidden"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                      <svg
                        className="w-6 h-6 hidden group-open:block"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </summary>

                    {/* Mobile Menu */}
                    <div className="absolute right-0 top-16 bg-gray-900/95 backdrop-blur border border-gray-800 rounded-xl p-4 space-y-2 w-48 shadow-xl">
                      <a
                        href="/playlists"
                        className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-blue-600/20 hover:to-purple-600/20 rounded-lg transition-all duration-200"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M5 3a2 2 0 00-2 2v2c0 .713.31 1.38.81 1.834A1 1 0 003 9h14a1 1 0 00.19-.166C16.69 8.38 17 7.713 17 7V5a2 2 0 00-2-2H5z" />
                          <path fillRule="evenodd" d="M3 9h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V9zm5.5 3a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm5 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" clipRule="evenodd" />
                        </svg>
                        Playlists
                      </a>
                      <a
                        href="/videos"
                        className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-blue-600/20 hover:to-purple-600/20 rounded-lg transition-all duration-200"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm4 2v4h8V8H6z" />
                        </svg>
                        Vidéos
                      </a>
                      <a
                        href="/converter"
                        className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-blue-600/20 hover:to-purple-600/20 rounded-lg transition-all duration-200"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 5.199V3a1 1 0 01-1-1zm.008 9a1 1 0 011.992 0 5 5 0 009.99 0 1 1 0 011.999 0 7 7 0 11-13.981 0z" clipRule="evenodd" />
                        </svg>
                        Convertisseur
                      </a>
                      <div className="border-t border-gray-700 my-2 pt-2 space-y-2">
                        <a
                          href="/playlists/create"
                          className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-blue-600/20 hover:to-purple-600/20 rounded-lg transition-all duration-200"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                          </svg>
                          Audio
                        </a>
                        <a
                          href="/videos/create"
                          className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-blue-600/20 hover:to-purple-600/20 rounded-lg transition-all duration-200"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                          </svg>
                          Vidéo
                        </a>
                      </div>
                    </div>
                  </details>
                </div>
              </div>
            </div>
          </div>

          {/* Gradient bottom border */}
          <div className="h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
        </nav>

        {/* Main Content */}
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-800 bg-gray-900/50 mt-20">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
              <div className="text-gray-400 text-sm">
                <p>© 2026 Media Controller. Tous droits réservés.</p>
                <p>Convertisseur universel de fichiers multimédia</p>
              </div>
              <div className="flex gap-6 text-gray-400">
                <a href="#" className="hover:text-blue-400 transition">GitHub</a>
                <a href="#" className="hover:text-blue-400 transition">Documentation</a>
                <a href="#" className="hover:text-blue-400 transition">Support</a>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
