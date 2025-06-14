/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#E6F8FE',
          100: '#B3DCFF',
          200: '#99E2FB',
          300: '#66D4F9',
          400: '#33C5F7',
          500: '#0080FF', // primary
          600: '#0077A0',
          700: '#005978',
          800: '#003C51',
          900: '#001E29',
        },
        secondary: {
          50: '#EDF9F8',
          100: '#DAF2F1',
          200: '#B5E6E3',
          300: '#90D9D5',
          400: '#6BCCC7',
          500: '#0080FF', // secondary
          600: '#31A2B8',
          700: '#24798A',
          800: '#18515C',
          900: '#0C282E',
        },
        accent: {
          50: '#FFF9E6',
          100: '#FFF3CC',
          200: '#FFE799',
          300: '#FFDB66',
          400: '#FFCF33',
          500: '#33CCFF', // accent
          600: '#CC9500',
          700: '#997000',
          800: '#664B00',
          900: '#332500',
        },
        success: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          300: '#6EE7B7',
          500: '#10B981', // success
          700: '#047857',
        },
        warning: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          300: '#FCD34D',
          500: '#F59E0B', // warning
          700: '#B45309',
        },
        error: {
          50: '#FEF2F2',
          100: '#FEE2E2',
          300: '#FCA5A5',
          500: '#EF4444', // error
          700: '#B91C1C',
        },
        neutral: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
      },
      fontFamily: {
        sans: ['Open Sans', 'sans-serif'],
        heading: ['Montserrat', 'sans-serif'],
      },
      spacing: {
        '1': '0.25rem',  // 4px
        '2': '0.5rem',   // 8px  
        '3': '0.75rem',  // 12px
        '4': '1rem',     // 16px
        '5': '1.25rem',  // 20px
        '6': '1.5rem',   // 24px
        '8': '2rem',     // 32px
        '10': '2.5rem',  // 40px
        '12': '3rem',    // 48px
        '16': '4rem',    // 64px
        '20': '5rem',    // 80px
        '24': '6rem',    // 96px
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'dropdown': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-gentle': 'pulseGentle 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseGentle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
    },
  },
  plugins: [],
};