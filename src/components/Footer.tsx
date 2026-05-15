import React from 'react';
import { useLocalization } from '../hooks/useLocalization';

export const Footer: React.FC = () => {
  const { t } = useLocalization();
  const logoSrc = '/logo.png'; // place your logo into public/logo.png

  return (
    <footer className="mt-12" style={{ borderTop: '1px solid var(--line)', background: 'var(--bg-elev)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          {/* Logo and description */}
          <div className="flex items-start gap-4">
            <div className="shrink-0">
              <img
                src={logoSrc}
                alt="Company logo"
                className="h-12 w-12 rounded-md object-cover"
                style={{ boxShadow: '0 0 0 1px var(--line)' }}
                onError={(e) => {
                  const container = (e.target as HTMLImageElement).parentElement;
                  if (!container) return;
                  (e.target as HTMLImageElement).style.display = 'none';
                  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                  svg.setAttribute('viewBox', '0 0 48 48');
                  svg.setAttribute('class', 'h-12 w-12');
                  svg.innerHTML = `
                    <defs>
                      <linearGradient id="g" x1="0" x2="1">
                        <stop offset="0%" stop-color="#f97316" />
                        <stop offset="100%" stop-color="#22d3ee" />
                      </linearGradient>
                    </defs>
                    <circle cx="24" cy="24" r="22" fill="url(#g)" opacity="0.25" />
                    <circle cx="24" cy="24" r="20" fill="none" stroke="url(#g)" stroke-width="2" />
                    <path d="M10 24h28M24 10v28" stroke="#f8fafc" stroke-opacity=".6" stroke-width="1.5" />
                  `;
                  container.appendChild(svg);
                }}
              />
            </div>
            <p className="text-sm leading-6 muted-2 max-w-xl">
              {t('footer.description')}
            </p>
          </div>

          {/* Navigation links */}
          <nav className="flex items-center gap-6">
            <a href="/support" className="text-sm muted-2 hover:text-ink">
              {t('footer.support')}
            </a>
            <span className="hidden md:inline" style={{ color: 'var(--line-2)' }}>|</span>
            <a href="/privacy" className="text-sm muted-2 hover:text-ink">
              {t('footer.privacy')}
            </a>
          </nav>
        </div>

        <div className="mt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Contact */}
          <div className="text-sm muted">
            <span className="mr-2">✉️ {t('footer.email')}:</span>
            <a href="mailto:hoopiq.pro@gmail.com" className="muted-2 hover:text-ink">
              hoopiq.pro@gmail.com
            </a>
          </div>

          {/* Social links */}
          <div className="flex items-center gap-4">
            <a
              href="https://t.me/akkkaba"
              target="_blank"
              rel="noreferrer"
              aria-label="Telegram"
              className="muted-2 hover:text-ink"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
                <path d="M9.03 14.67l-.15 3.18c.21 0 .3-.09.41-.2l1.98-1.9 4.1 3c.75.41 1.29.2 1.5-.69l2.72-12.77c.24-1.12-.41-1.55-1.14-1.28L2.7 9.36c-1.09.42-1.07 1.02-.19 1.29l4.67 1.46 10.84-6.71c.51-.31.98-.14.6.17z"/>
              </svg>
            </a>
            <a
              href="https://www.instagram.com/hooopiq/"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="muted-2 hover:text-ink"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
                <path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm0 2a3 3 0 00-3 3v10a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H7zm5 3.5A5.5 5.5 0 1111.999 19.5 5.5 5.5 0 0112 7.5zm0 2A3.5 3.5 0 1015.5 13 3.5 3.5 0 0012 9.5zm6.25-3.25a1.25 1.25 0 11-1.25 1.25 1.25 1.25 0 011.25-1.25z"/>
              </svg>
            </a>
            <a
              href="https://x.com/namelezzz4"
              target="_blank"
              rel="noreferrer"
              aria-label="X"
              className="muted-2 hover:text-ink"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
                <path d="M18.244 3H21l-6.46 7.39L22.5 21h-5.5l-4.3-5.5L7 21H3.244l6.892-7.885L1.5 3H7l4.02 5.23L18.244 3zm-1.926 16h1.42L8.82 5h-1.51l8.008 14z"/>
              </svg>
            </a>
          </div>
        </div>

        <div className="mt-8 text-xs muted">
          {t('footer.rights')}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
