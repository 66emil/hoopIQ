/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        bg:         'var(--bg)',
        'bg-elev':  'var(--bg-elev)',
        'bg-card':  'var(--bg-card)',
        'bg-soft':  'var(--bg-soft)',
        ink:        'var(--ink)',
        'ink-2':    'var(--ink-2)',
        'ink-3':    'var(--ink-3)',
        'ink-4':    'var(--ink-4)',
        line:       'var(--line)',
        'line-2':   'var(--line-2)',
        accent: {
          DEFAULT: 'var(--accent)',
          deep:    'var(--accent-deep)',
          soft:    'var(--accent-soft)',
          tint:    'var(--accent-tint)',
          glow:    'var(--accent-glow)',
        },
        sage:   'var(--sage)',
        brick:  'var(--brick)',
        gold:   'var(--gold)',
        slate2: 'var(--slate)',
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans:    ['Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xs: '8px', sm: '12px', md: '18px', lg: '24px', xl: '32px',
      },
      boxShadow: {
        '1': 'var(--shadow-1)',
        '2': 'var(--shadow-2)',
        '3': 'var(--shadow-3)',
      },
      keyframes: {
        'rise-fade':  { '0%': { opacity: 0, transform: 'translateY(14px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        'pulse-ring': { '0%': { boxShadow: '0 0 0 0 rgba(224,139,78,.6)' }, '100%': { boxShadow: '0 0 0 18px transparent' } },
        float:        { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-6px)' } },
      },
      animation: {
        'rise-fade':  'rise-fade .65s cubic-bezier(.22,1,.36,1) both',
        'pulse-ring': 'pulse-ring 2s cubic-bezier(.22,1,.36,1) infinite',
        float:        'float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
