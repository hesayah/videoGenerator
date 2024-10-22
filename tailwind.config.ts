import type { Config } from "tailwindcss";
import daisyui from "daisyui"


const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/remotion/**/*.{js,ts,jsx,tsx,mdx}",

  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      textShadow: {
        'default': '2px 2px 4px rgba(0, 0, 0, 0.5)', // Ombre noire standard
      },
    },
  },
  plugins: [ 
    daisyui,
    function ({ addUtilities }: { addUtilities: (utilities: Record<string, any>) => void }) {
      addUtilities({
        '.text-shadow-black': {
          'text-shadow': '2px 2px 8px rgba(50, 50, 50, 1)',
        },
      });
    },
    require('tailwind-scrollbar'),
  ],
};
export default config;
