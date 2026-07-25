/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        blossom: {
          50: '#FFFBFD',
          100: '#FDF2F8',
          200: '#F8BBD9',
          300: '#F49AC4',
          400: '#EC6FA8',
          500: '#DB2C7A',
          600: '#B81F63'
        },
        lavender: {
          50: '#FAF9FF',
          100: '#F1EEFB',
          200: '#E3DCF5',
          300: '#CBC0EA'
        },
        ink: {
          700: '#3A3342',
          900: '#241F29'
        }
      },
      fontFamily: {
        display: ['Poppins', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        friendly: ['Nunito', 'sans-serif']
      },
      boxShadow: {
        glass: '0 8px 32px rgba(219, 44, 122, 0.10)',
        soft: '0 4px 20px rgba(58, 51, 66, 0.06)'
      },
      borderRadius: {
        xl2: '1.75rem'
      },
      keyframes: {
        floatUp: {
          '0%': { transform: 'translateY(0) rotate(0deg)', opacity: '0' },
          '10%': { opacity: '0.35' },
          '90%': { opacity: '0.25' },
          '100%': { transform: 'translateY(-110vh) rotate(25deg)', opacity: '0' }
        },
        pulseSoft: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.04)' }
        }
      },
      animation: {
        floatUp: 'floatUp linear infinite',
        pulseSoft: 'pulseSoft 2.4s ease-in-out infinite'
      }
    }
  },
  plugins: []
}
