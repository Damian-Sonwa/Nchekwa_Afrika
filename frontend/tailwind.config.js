/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ["Inter", "sans-serif"],
        poppins: ["Poppins", "sans-serif"],
      },
      colors: {
        // Nchekwa_Afrika - Vibrant African-inspired color palette
        primary: "#E63946",        // Vibrant coral red - energy and passion
        primaryLight: "#F77F7F",  // Soft coral - warmth and comfort
        accent: "#F4A261",         // Golden orange - sunshine and hope
        accentLight: "#F9C784",    // Light golden - brightness
        secondary: "#2A9D8F",      // Teal green - growth and healing
        secondaryLight: "#4ECDC4", // Light teal - freshness
        background: "#FFF8F0",     // Warm cream - soft and welcoming
        dark: "#1A1A2E",           // Deep navy - depth and stability
        light: "#6B7280",          // Soft gray - balanced text
        success: "#10B981",        // Emerald green - growth and success
        error: "#EF4444",          // Bright red - alert and attention
        warning: "#F59E0B",        // Amber - caution and warmth
        info: "#3B82F6",           // Sky blue - clarity and trust
      },
      borderRadius: {
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.25rem",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "pulse-slow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "slide-in": "slide-in 0.3s ease-out",
        "pulse-slow": "pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
}
