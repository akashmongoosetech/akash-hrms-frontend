module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      animation: {
        'bounce-slow': 'bounce 2s infinite',
      },
    },
  },
  plugins: [
    require('@tailwindcss/line-clamp'),
  ],
};
