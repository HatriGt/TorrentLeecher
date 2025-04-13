
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(240, 5.9%, 90%)",
        input: "hsl(240, 5.9%, 90%)",
        ring: "hsl(207, 70%, 50%)", // Blue accent for focus rings
        background: "hsl(0, 0%, 100%)", // White background
        foreground: "hsl(222, 47%, 30%)", // Dark blue for primary text (#274574)
        primary: {
          DEFAULT: "hsl(207, 70%, 50%)", // Bright blue (#1F8BFF)
          foreground: "hsl(0, 0%, 100%)", // White text on blue
        },
        secondary: {
          DEFAULT: "hsl(282, 60%, 67%)", // Purple (#C278EB)
          foreground: "hsl(0, 0%, 100%)", // White text on purple
        },
        muted: {
          DEFAULT: "hsl(210, 20%, 95%)", // Very light blue-gray
          foreground: "hsl(215, 25%, 40%)", // Medium blue for muted text
        },
        accent: {
          DEFAULT: "hsl(340, 70%, 65%)", // Pink accent (#F16C96)
          foreground: "hsl(0, 0%, 100%)", // White text on accent
        },
        destructive: {
          DEFAULT: "hsl(0, 84.2%, 60.2%)", // Bright red for errors
          foreground: "hsl(0, 0%, 98%)",
        },
        card: {
          DEFAULT: "hsl(0, 0%, 100%)", // White card background
          foreground: "hsl(222, 47%, 30%)", // Dark blue text on cards
        },
      },
      textColor: {
        'theme-navy': 'hsl(222, 47%, 30%)', // Dark blue (#274574)
        'theme-blue': 'hsl(207, 70%, 50%)', // Bright blue (#1F8BFF)
        'theme-purple': 'hsl(282, 60%, 67%)', // Purple (#C278EB)
        'theme-pink': 'hsl(340, 70%, 65%)', // Pink (#F16C96)
        'theme-gray': 'hsl(215, 25%, 40%)', // Medium blue-gray
      },
      backgroundColor: {
        'theme-navy': 'hsl(222, 47%, 30%)', // Dark blue (#274574)
        'theme-blue': 'hsl(207, 70%, 50%)', // Bright blue (#1F8BFF)
        'theme-purple': 'hsl(282, 60%, 67%)', // Purple (#C278EB)
        'theme-pink': 'hsl(340, 70%, 65%)', // Pink (#F16C96)
        'theme-light': 'hsl(210, 20%, 95%)', // Very light blue-gray
      },
      gradientColorStops: {
        'theme-navy': 'hsl(222, 47%, 30%)', // Dark blue (#274574)
        'theme-blue': 'hsl(207, 70%, 50%)', // Bright blue (#1F8BFF)
        'theme-purple': 'hsl(282, 60%, 67%)', // Purple (#C278EB)
        'theme-pink': 'hsl(340, 70%, 65%)', // Pink (#F16C96)
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      fontFamily: {
        'sans': ['Inter', 'ui-sans-serif', 'system-ui'],
        'mono': ['JetBrains Mono', 'monospace'],
        'display': ['Lexend', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 20px rgba(31, 139, 255, 0.2)',
        'card': '0 4px 20px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
