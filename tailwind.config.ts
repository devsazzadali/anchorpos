import type { Config } from 'tailwindcss';
import { fontFamily } from 'tailwindcss/defaultTheme';

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', ...fontFamily.sans],
        display: ['var(--font-outfit)', ...fontFamily.sans],
        mono: ['var(--font-jetbrains-mono)', ...fontFamily.mono],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        brand: {
          50:  '#f0f4ff',
          100: '#e0e9ff',
          200: '#c7d5ff',
          300: '#a4b9ff',
          400: '#7c93ff',
          500: '#5a67f5',
          600: '#4449e0',
          700: '#3637c5',
          800: '#2e2f9f',
          900: '#2a2d7e',
          950: '#1a1b4b',
        },
        surface: {
          50:  '#f8f9fc',
          100: '#f0f1f7',
          200: '#e2e4ee',
          300: '#cdd0df',
          400: '#9da2b8',
          500: '#6b7190',
          600: '#4d5470',
          700: '#3a3f58',
          800: '#282c40',
          900: '#191c2e',
          950: '#0f1020',
        },
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #5a67f5 0%, #7c4dff 100%)',
        'gradient-dark':  'linear-gradient(135deg, #191c2e 0%, #282c40 100%)',
      },
      boxShadow: {
        'glow':       '0 0 20px rgba(90, 103, 245, 0.3)',
        'glow-lg':    '0 0 40px rgba(90, 103, 245, 0.2)',
        'card':       '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
        'card-hover': '0 10px 30px rgba(0,0,0,0.15)',
      },
      animation: {
        'fade-in':        'fadeIn 0.3s ease-in-out',
        'slide-up':       'slideUp 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'scale-in':       'scaleIn 0.2s ease-out',
        'pulse-glow':     'pulseGlow 2s infinite',
        'shimmer':        'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeIn:       { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp:      { from: { transform: 'translateY(10px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
        slideInRight: { from: { transform: 'translateX(20px)', opacity: '0' }, to: { transform: 'translateX(0)', opacity: '1' } },
        scaleIn:      { from: { transform: 'scale(0.95)', opacity: '0' }, to: { transform: 'scale(1)', opacity: '1' } },
        pulseGlow:    {
          '0%, 100%': { boxShadow: '0 0 20px rgba(90,103,245,0.3)' },
          '50%':      { boxShadow: '0 0 40px rgba(90,103,245,0.6)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/typography'),
  ],
};

export default config;
