/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class', '[data-theme="dark"]'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        ink: 'var(--color-text-primary)',
        muted: 'var(--color-text-secondary)',
        accent: 'var(--color-accent)',
        danger: 'var(--color-status-danger)',
        warning: 'var(--color-status-warning)',
        success: 'var(--color-status-ok)'
      },
      borderRadius: { card: 'var(--radius-card)' },
      fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'] }
    }
  },
  plugins: []
};
