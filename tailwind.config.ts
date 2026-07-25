import type { Config } from 'tailwindcss';

// Design tokens Human Design Enterprise.
// Palet terinspirasi bodygraph HD (dirender di latar gelap dengan warna
// energy-center yang khas) tanpa meniru chart berlisensi secara langsung.
const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0B0E14',
        surface: {
          DEFAULT: '#131720',
          hover: '#1A1F2C',
        },
        border: {
          DEFAULT: '#242B3D',
          strong: '#333B52',
        },
        primary: {
          DEFAULT: '#6E56CF',
          hover: '#7C63E0',
          muted: '#3D3466',
        },
        accent: {
          DEFAULT: '#E8A33D',
          hover: '#F0B65C',
        },
        foreground: {
          DEFAULT: '#F0EDE4',
          muted: '#8B93A7',
          subtle: '#5B6478',
        },
        danger: {
          DEFAULT: '#E5484D',
          bg: '#3A1E20',
        },
        success: {
          DEFAULT: '#3DB88A',
          bg: '#173029',
        },
      },
      fontFamily: {
        display: ['var(--font-fraunces)', 'ui-serif', 'serif'],
        sans: ['var(--font-inter)', 'ui-sans-serif', 'sans-serif'],
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.25rem',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(110, 86, 207, 0.15), 0 8px 32px -8px rgba(110, 86, 207, 0.25)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out forwards',
      },
    },
  },
  plugins: [],
};

export default config;

