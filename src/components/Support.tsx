import React from 'react';
import { useLocalization } from '../hooks/useLocalization';

export const Support = () => {
  const { t } = useLocalization();
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-4">{t('support.heading')}</h1>
      <p className="muted-2 mb-8">
        {t('support.desc')} Below you will find quick links to our Telegram, Instagram and X.
      </p>

      <div className="flex items-center gap-6">
        <a
          href="https://t.me/akkkaba"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 muted-2 hover:text-ink"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true">
            <path d="M9.03 14.67l-.15 3.18c.21 0 .3-.09.41-.2l1.98-1.9 4.1 3c.75.41 1.29.2 1.5-.69l2.72-12.77c.24-1.12-.41-1.55-1.14-1.28L2.7 9.36c-1.09.42-1.07 1.02-.19 1.29l4.67 1.46 10.84-6.71c.51-.31.98-.14.6.17z"/>
          </svg>
          Telegram
        </a>

        <a
          href="https://www.instagram.com/hooopiq/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 muted-2 hover:text-ink"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true">
            <path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm0 2a3 3 0 00-3 3v10a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H7zm5 3.5A5.5 5.5 0 1111.999 19.5 5.5 5.5 0 0112 7.5zm0 2A3.5 3.5 0 1015.5 13 3.5 3.5 0 0012 9.5zm6.25-3.25a1.25 1.25 0 11-1.25 1.25 1.25 1.25 0 011.25-1.25z"/>
          </svg>
          Instagram
        </a>

        <a
          href="https://x.com/namelezzz4"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 muted-2 hover:text-ink"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true">
            <path d="M18.244 3H21l-6.46 7.39L22.5 21h-5.5l-4.3-5.5L7 21H3.244l6.892-7.885L1.5 3H7l4.02 5.23L18.244 3zm-1.926 16h1.42L8.82 5h-1.51l8.008 14z"/>
          </svg>
          X
        </a>
      </div>

      <div className="mt-10 muted-2">
        {t('support.email')}
        {' '}<a href="mailto:hoopiq.pro@gmail.com" className="hover:text-ink">hoopiq.pro@gmail.com</a>.
      </div>
    </div>
  );
};

export default Support;
