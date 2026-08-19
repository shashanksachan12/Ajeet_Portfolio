/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./js/**/*.js",
    "./data/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        obsidian: "#050505",
        matte: "#121212",
        silver: "#a3a3a3",
        acid: "#ccff00"
      },
      fontFamily: {
        display: ["Clash Display", "sans-serif"],
        body: ["Satoshi", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"]
      }
    }
  },
  safelist: [
    "hidden",
    "opacity-0",
    "scale-95",
    "bg-acid",
    "text-obsidian",
    "border-acid",
    "border-white/20",
    "text-silver",
    "text-acid"
  ]
};
