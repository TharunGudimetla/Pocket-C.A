import type { Config } from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '1rem',
    },
    extend: {
      colors: {
        canvas: 'var(--canvas)',
        surface: 'var(--surface)',
        sidebar: 'var(--sidebar)',
        border: 'var(--border-color)',
        card: 'var(--card-bg)',
        ink: {
          DEFAULT: 'var(--ink-default)',
          muted: 'var(--ink-muted)',
          faint: 'var(--ink-faint)',
        },
        brand: {
          blue: '#2F6FED',
          'blue-dark': '#1E4FC4',
          teal: '#14B8A6',
          emerald: '#10B981',
          navy: '#0F172A',
        },
        chip: {
          rose: 'var(--chip-rose)',
          amber: 'var(--chip-amber)',
          mint: 'var(--chip-mint)',
          violet: 'var(--chip-violet)',
          sky: 'var(--chip-sky)',
        },
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #2F6FED 0%, #14B8A6 100%)',
        'brand-gradient-hover': 'linear-gradient(135deg, #2563EB 0%, #0D9488 100%)',
        'brand-gradient-soft': 'linear-gradient(135deg, rgba(47,111,237,0.12) 0%, rgba(20,184,166,0.12) 100%)',
        'dark-gradient-soft': 'linear-gradient(135deg, rgba(47,111,237,0.20) 0%, rgba(20,184,166,0.20) 100%)',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        floating: 'var(--shadow-floating)',
        glow: '0 0 20px rgba(47, 111, 237, 0.15)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      keyframes: {
        'bounce-dot': {
          '0%, 80%, 100%': { transform: 'scale(0.6)', opacity: '0.4' },
          '40%': { transform: 'scale(1)', opacity: '1' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'bounce-dot': 'bounce-dot 1.4s infinite ease-in-out both',
        'fade-up': 'fade-up 0.35s ease-out both',
      },
    },
  },
  plugins: [],
} satisfies Config;
