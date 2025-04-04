export const content = [
  "./src/**/*.{js,jsx,ts,tsx}", // Ensure Tailwind scans your components for utility classes
  "./node_modules/daisyui/dist/**/*.js", // Include DaisyUI components
];
export const theme = {
  extend: {
    fontFamily: {
      sans: ['Space Grotesk', 'sans-serif'],
    },
    keyframes: {
      'fade-in-up': {
        '0%': {
          opacity: '0',
          transform: 'translateY(10px)'
        },
        '100%': {
          opacity: '1',
          transform: 'translateY(0)'
        },
      },
      'pulse-gentle': {
        '0%, 100%': {
          opacity: '1',
          transform: 'scale(1)'
        },
        '50%': {
          opacity: '0.9',
          transform: 'scale(1.02)'
        },
      }
    },
    animation: {
      'fade-in-up': 'fade-in-up 0.3s ease-out',
      'pulse-gentle': 'pulse-gentle 3s ease-in-out infinite',
    }
  },
};
export const plugins = [
  // eslint-disable-next-line no-undef
  require("daisyui"), // Add DaisyUI as a plugin
];
