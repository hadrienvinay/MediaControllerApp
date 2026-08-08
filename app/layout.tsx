import type { Metadata } from 'next';
import "./globals.css";

export const metadata: Metadata = {
  title: 'Media Controller',
  description: 'Convertisseur universel — audio, vidéo, images, PDF, outils dev.',
  icons: { icon: '/favicon.svg', apple: '/favicon.svg' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="antialiased min-h-screen flex flex-col" style={{ background: 'var(--bg)', color: 'var(--text)' }}>

        {/* ── Top bar ── */}
        <header style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}
          className="sticky top-0 z-50 flex items-center h-12 px-4 gap-4">

          {/* Logo */}
          <a href="/" className="flex items-center gap-2 shrink-0 no-underline group">
            <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}
              className="text-sm font-bold tracking-tight">MC</span>
            <span style={{ color: 'var(--muted)', fontSize: '.7rem', letterSpacing: '.04em' }}
              className="hidden sm:block font-mono uppercase">Media Controller</span>
          </a>

          {/* Nav links */}
          <nav className="flex items-center gap-0.5 ml-2">
            {[
              { href: '/converter', label: 'Convertisseur' },
              { href: '/playlists', label: 'Playlists' },
              { href: '/videos',    label: 'Vidéos' },
            ].map(({ href, label }) => (
              <a key={href} href={href}
                style={{ fontFamily: 'var(--font-mono)', fontSize: '.72rem', letterSpacing: '.02em', color: 'var(--muted)' }}
                className="px-3 py-1.5 rounded transition-colors hover:bg-[var(--surface2)] hover:text-[var(--text)]">
                {label}
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="ml-auto flex items-center gap-2">
            <a href="/playlists/create"
              style={{ fontFamily: 'var(--font-mono)', fontSize: '.68rem', letterSpacing: '.04em', background: 'var(--surface2)', color: 'var(--muted)', border: '1px solid var(--border2)' }}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded transition-colors hover:text-[var(--text)] hover:border-[var(--faint)]">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 2a1 1 0 011 1v4h4a1 1 0 010 2H9v4a1 1 0 01-2 0V9H3a1 1 0 010-2h4V3a1 1 0 011-1z"/>
              </svg>
              Playlist
            </a>
            <a href="/videos/create"
              style={{ fontFamily: 'var(--font-mono)', fontSize: '.68rem', letterSpacing: '.04em', background: 'var(--accent-bg)', color: 'var(--accent)', border: '1px solid var(--accent-border)' }}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded transition-colors hover:bg-[rgba(57,208,207,0.12)]">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 2a1 1 0 011 1v4h4a1 1 0 010 2H9v4a1 1 0 01-2 0V9H3a1 1 0 010-2h4V3a1 1 0 011-1z"/>
              </svg>
              Montage
            </a>

            {/* Mobile menu */}
            <details className="md:hidden relative">
              <summary className="list-none cursor-pointer p-1.5 rounded hover:bg-[var(--surface2)] transition-colors"
                style={{ color: 'var(--muted)' }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
                </svg>
              </summary>
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', top: '2rem', right: 0 }}
                className="absolute rounded-lg p-2 w-44 shadow-xl space-y-0.5 z-50">
                {[
                  { href: '/converter',       label: 'Convertisseur' },
                  { href: '/playlists',        label: 'Playlists' },
                  { href: '/videos',           label: 'Vidéos' },
                  { href: '/playlists/create', label: '+ Playlist' },
                  { href: '/videos/create',    label: '+ Montage' },
                ].map(({ href, label }) => (
                  <a key={href} href={href}
                    style={{ fontFamily: 'var(--font-mono)', fontSize: '.72rem', color: 'var(--muted)' }}
                    className="flex items-center px-3 py-2 rounded hover:bg-[var(--surface2)] hover:text-[var(--text)] transition-colors">
                    {label}
                  </a>
                ))}
              </div>
            </details>
          </div>
        </header>

        {/* ── Content ── */}
        <main className="flex-1">
          {children}
        </main>

        {/* ── Footer ── */}
        <footer style={{ borderTop: '1px solid var(--border)', background: 'var(--surface)' }}
          className="px-6 py-4 flex items-center justify-between gap-4">
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '.62rem', letterSpacing: '.06em', color: 'var(--faint)' }}>
            © 2026 MEDIA CONTROLLER
          </span>
          <div className="flex gap-4">
            {['GitHub', 'Docs', 'Support'].map(l => (
              <a key={l} href="#"
                style={{ fontFamily: 'var(--font-mono)', fontSize: '.62rem', letterSpacing: '.04em', color: 'var(--faint)' }}
                className="hover:text-[var(--muted)] transition-colors">{l}</a>
            ))}
          </div>
        </footer>
      </body>
    </html>
  );
}
