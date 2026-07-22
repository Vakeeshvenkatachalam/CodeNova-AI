import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Class-based dark mode (adds class="dark" on <html>)
  theme: {
    extend: {
      colors: {
        // Light & Dark canvas tokens
        brand: {
          light: '#f8fafc', // slate-50
          dark: '#040406',  // premium midnight anthracite
        },
        surface: {
          light: '#ffffff',
          dark: '#0b0b0f',  // clean matte graphite surface
        },
        border: {
          light: '#e2e8f0', // slate-200
          dark: '#161622',  // ultra-thin sleek border lines
        },
        // Core functional colors
        primary: {
          DEFAULT: '#6366f1', // indigo-500
          hover: '#4f46e5',   // indigo-600
          focus: 'rgba(99, 102, 241, 0.5)',
        },
        ai: {
          DEFAULT: '#14b8a6', // teal-500 (AI Mentor specific accent)
          hover: '#0d9488',   // teal-600
          glow: 'rgba(20, 184, 166, 0.15)',
        },
        // Text hierarchies
        content: {
          primary: {
            light: '#0f172a', // slate-900
            dark: '#f8fafc',  // slate-50
          },
          secondary: {
            light: '#475569', // slate-600
            dark: '#cbd5e1',  // slate-300
          },
          muted: {
            light: '#94a3b8', // slate-400
            dark: '#64748b',  // slate-500
          }
        },
        // Semantic validation colors
        success: '#10b981', // emerald-500
        warning: '#f59e0b', // amber-500
        danger: '#ef4444',  // red-500
        info: '#3b82f6',    // blue-500
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glow-ai': '0 0 15px rgba(20, 184, 166, 0.25)',
        'glow-brand': '0 0 15px rgba(99, 102, 241, 0.25)',
      },
    },
  },
  plugins: [],
};

export default config;
