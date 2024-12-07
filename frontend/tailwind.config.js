export const content = [
  "./src/**/*.{js,jsx,ts,tsx}", // Ensure Tailwind scans your components for utility classes
  "./node_modules/daisyui/dist/**/*.js", // Include DaisyUI components
];
export const theme = {
  extend: {
    fontFamily: {
      sans: ['Space Grotesk', 'sans-serif'],
    },
  },
};
export const plugins = [
  // eslint-disable-next-line no-undef
  require("daisyui"), // Add DaisyUI as a plugin
];
