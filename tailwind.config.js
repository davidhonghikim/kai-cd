/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './popup.html',
    './sidepanel.html',
    './tab.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './docs.html'
  ],
  theme: {
    extend: {
      colors: {
        'background-primary': 'rgb(var(--background-primary) / <alpha-value>)',
        'background-secondary': 'rgb(var(--background-secondary) / <alpha-value>)',
        'background-tertiary': 'rgb(var(--background-tertiary) / <alpha-value>)',
        'text-primary': 'rgb(var(--text-primary) / <alpha-value>)',
        'text-secondary': 'rgb(var(--text-secondary) / <alpha-value>)',
        'text-placeholder': 'rgb(var(--text-placeholder) / <alpha-value>)',
        'accent-primary': 'rgb(var(--accent-primary) / <alpha-value>)',
        'accent-primary-state': 'rgb(var(--accent-primary-state) / <alpha-value>)',
        'border-primary': 'rgb(var(--border-primary) / <alpha-value>)',
        red: 'rgb(var(--red) / <alpha-value>)',
        green: 'rgb(var(--green) / <alpha-value>)',
        blue: 'rgb(var(--blue) / <alpha-value>)',
        yellow: 'rgb(var(--yellow) / <alpha-value>)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}; 