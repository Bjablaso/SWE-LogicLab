// Turns a color name into the CSS variable from global.css
const c = (name) => `var(--color-${name})`;
//const c = (name) => `rgb(var(--color-${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Main backgrounds
        background: c("background"),
        surface: c("surface"),
        surfaceShadow: c("surfaceShadow"),
        input: c("input"),
        nav: c("nav"),

        // Borders / controls
        border: c("border"),
        control: c("control"),
        outline: c("outline"),

        // Text
        foreground: c("foreground"),
        muted: c("muted"),
        subtle: c("subtle"),
        placeholder: c("placeholder"),
        disabled: c("disabled"),

        // Accent
        accent: c("accent"),
        accentHover: c("accentHover"),
        link: c("link"),
        onAccent: c("onAccent"),

        // Warning
        warningBg: c("warningBg"),
        warningBorder: c("warningBorder"),
        warningText: c("warningText"),

        // Base font
        baseFont: c("baseFont"),

        // Gray scale
        baseGray100: c("baseGray100"),
        baseGray200: c("baseGray200"),
        baseGray300: c("baseGray300"),
        baseGray400: c("baseGray400"),
        baseGray500: c("baseGray500"),
        baseGray600: c("baseGray600"),
        searchBarBg: c("searchBarBg"),

        warning: { bg: c('warning-bg'), border: c('warning-border'), text: c('warning-text') },
      },
    },
  },
  plugins: [],
};