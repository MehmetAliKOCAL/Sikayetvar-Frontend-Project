/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-49deg':
          'linear-gradient(49deg, var(--tw-gradient-stops))',
        'gradient-134deg':
          'linear-gradient(134deg, var(--tw-gradient-stops))',
        'gradient-radial':
          'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors: {
        themeColor: '#FEAF00',
        'themeColor-lighter': '#F8D442',
        'themeColor-faded': '#F2EAE1',
        fadedTextColor: '#6C6C6C',
        loginFormBorderColor: '#E5E5E5',
        inputPlaceholderColor: '#CDCDCD',
      },
      boxShadow: {
        loginForm:
          '2px 5px 10px 0px rgba(0, 0, 0, 0.10)',
      },
      borderWidth: {
        1: '1px',
        6: '6px',
      },
      fontSize: {
        '3.5xl': '32px',
      },
      screens: {
        xs: '420px',
      },
      width: {
        68: '270px',
      },
    },
  },
  plugins: [],
};
