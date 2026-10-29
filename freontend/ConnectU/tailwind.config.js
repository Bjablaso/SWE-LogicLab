// Turns a color name into the CSS variable from global.css
const c = (name) => `rgb(var(--color-${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: c('background'),
        surface: c('surface'),
        input: c('input'),
        nav: c('nav'),
        border: c('border'),
        control: c('control'),
        outline: c('outline'),
        baseFont: c('baseFont'),
        baseGray100: c('baseGray100'),
        onAccent: c('onAccent'),

        foreground: c('foreground'),
        muted: c('muted'),
        subtle: c('subtle'),
        placeholder: c('placeholder'),
        disabled: c('disabled'),

        accent: { DEFAULT: c('accent'), hover: c('accent-hover') },
        link: c('link'),
        'on-accent': c('on-accent'),

        warning: { bg: c('warning-bg'), border: c('warning-border'), text: c('warning-text') },
      },
    },
  },
  plugins: [],
};