/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Modern Dark Mode Theme
        primary: {
          DEFAULT: "#0a3d2f", // Very dark green
          light: "#b0ff9e", // Light green accent
          dark: "#0a0a0a", // Near black
        },
        accent: {
          DEFAULT: "#a3ff7f", // Bright green
          gold: "#ffd700", // Gold for hover states
          blue: "#cce5ff", // Light blue for secondary accents
        },
        background: {
          DEFAULT: "#0a3d2f", // Very dark green
          dark: "#0a0a0a", // Near black
          light: "#0a3d2f", // Same as default for consistency
        },
        text: {
          main: "#f0f0f0", // Light color for primary text
          secondary: "#b0ff9e", // Light green for secondary text
          placeholder: "#888888", // Subtle gray for placeholders
        },
        // Keep utility colors for alerts/notifications
        success: "#a3ff7f",
        error: "#EF4444",
        warning: "#F59E0B",
        info: "#cce5ff",
      },
      fontFamily: {
        heading: ["Inter", "sans-serif"],
        body: ["Inter", "sans-serif"],
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
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "slide-in": "slide-in 0.3s ease-out",
        "pulse-slow": "pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
}
