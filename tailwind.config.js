/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#EFF7F9",
        foreground: "#123247",
        card: "#FFFFFF",
        border: "#DCEAEE",
        input: "#DCEAEE",
        muted: "#E3F1F5",
        "muted-fg": "#5C7E8C",
        "muted-foreground": "#5C7E8C",

        primary: "#186787",
        "primary-foreground": "#FFFFFF",
        "primary-tint": "#E3F1F5",
        "brand-mid": "#2087A8",
        "brand-light": "#2FC1D3",

        sun: "#FCD462",
        "sun-tint": "#FBEFC6",
        destructive: "#B03D3D",

        // Metric + status hex from igloo-report.ts; *-tint via culori oklch→hex
        bp: "#B14A62",
        "bp-tint": "#FEE8EB",
        hr: "#C17A3B",
        "hr-tint": "#FDECDE",
        ox: "#2C7A78",
        "ox-tint": "#DFF3F2",
        glu: "#6B5B95",
        "glu-tint": "#EFECFC",

        good: "#457A5C",
        "good-tint": "#E3F3E9",
        watch: "#B0813A",
        "watch-tint": "#FBEEDD",
        urgent: "#B03D3D",
        "urgent-tint": "#FFE8E5",
      },
      fontFamily: {
        sans: ["Manrope-Regular"],
        "sans-medium": ["Manrope-Medium"],
        "sans-semibold": ["Manrope-SemiBold"],
        "sans-bold": ["Manrope-Bold"],
        serif: ["Fraunces-Regular"],
        "serif-medium": ["Fraunces-Medium"],
        "serif-semibold": ["Fraunces-SemiBold"],
        "serif-bold": ["Fraunces-Bold"],
      },
      borderRadius: {
        sm: "16px",
        md: "18px",
        lg: "20px",
        xl: "24px",
        "2xl": "28px",
        "3xl": "32px",
        "4xl": "36px",
        card: "22px",
      },
    },
  },
  plugins: [],
};

