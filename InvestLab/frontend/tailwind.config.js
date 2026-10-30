/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        finBg: '#F7F9FC',
        finSurface: '#FFFFFF',
        finNavy: {
          DEFAULT: '#172B4D',
          light: '#253858',
          dark: '#091E42',
        },
        finBlue: {
          DEFAULT: '#2563EB',
          hover: '#1D4ED8',
          light: '#EFF6FF',
          muted: '#DBEAFE',
        },
        finPositive: {
          DEFAULT: '#16A34A',
          light: '#DCFCE7',
          dark: '#15803D',
        },
        finNegative: {
          DEFAULT: '#DC2626',
          light: '#FEE2E2',
          dark: '#B91C1C',
        },
        finText: {
          primary: '#0F172A',
          secondary: '#64748B',
          muted: '#94A3B8',
        },
        finBorder: {
          DEFAULT: '#E2E8F0',
          dark: '#334155',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        finCard: '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)',
        finElevated: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        finModal: '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [],
};
