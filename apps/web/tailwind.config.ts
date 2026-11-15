import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: 'var(--denryu-bg-canvas)',
        surface: 'var(--denryu-bg-surface)',
        elevated: 'var(--denryu-bg-elevated)',
        subtle: 'var(--denryu-border-subtle)',
        focus: 'var(--denryu-border-focus)',
        'text-primary': 'var(--denryu-text-primary)',
        'text-secondary': 'var(--denryu-text-secondary)',
        'text-muted': 'var(--denryu-text-muted)',
        cyan: {
          accent: 'var(--denryu-accent-cyan)',
        },
        water: {
          accent: 'var(--denryu-accent-water)',
        },
        energy: {
          accent: 'var(--denryu-accent-energy)',
        },
        status: {
          success: 'var(--denryu-status-success)',
          warning: 'var(--denryu-status-warning)',
          error: 'var(--denryu-status-error)',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', '"Inter"', 'system-ui', 'sans-serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config;
