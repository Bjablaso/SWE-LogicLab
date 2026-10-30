//: theme.ts src/app/constant/theme.ts
export const palette = {
    light: {
        background: '#eff1dc', surface: '#ffffff', input: '#F4F2EC', nav: '#edebe6',
        surfaceShadow:"#ffffff",
        border: '#E4E1D8', control: '#D6D2C7', outline: '#BDB8AC',
        foreground: '#141414', muted: '#5C584F', subtle: '#6B675E',
        placeholder: '#8A867C', disabled: '#A8A398',
        accent: '#FFC800', accentHover: '#E6B400', link: '#8A6400', onAccent: '#121212',
        warningBg: '#FFF6D6', warningBorder: '#E6C25A', warningText: '#6B5400',
        // baseFont: '#000000', baseGray100: '#656464',
        baseFont: '#000000',
        baseGray100: '#afaeae', baseGray200: '#B3B3B3', baseGray300: '#999999',
        baserGray400: '#808080', baseGray500: '#6B6B6B', baseGray600: '#555555',
        searchBarBg: "#ffffff"


    },
    dark: {
        background: '#111111', surface: '#303030', input: '#181818', nav: '#171717',
        border: '#2F2F2F', control: '#3A3A3A', outline: '#4A4A4A',
        foreground: '#F6F4EE', muted: '#B1ADA1', subtle: '#9E9A90',
        placeholder: '#8E8A80', disabled: '#6E6A62',
        accent: '#FFC800', accentHover: '#FFE680', link: '#FFD12E', onAccent: '#121212',
        warningBg: '#2A2310', warningBorder: '#6B5400', warningText: '#FFE08A',
        baseFont: '#ffffff',
        surfaceShadow:"#d3cece",
        baseGray100: '#302f2f', baseGray200: '#525252', baseGray300: '#6B6B6B',
        baseGray400: '#858585', baseGray500: '#A3A3A3', baseGray600: '#C2C2C2',
        searchBarBg: "#111111",
    },
};


export type ThemeColors = typeof palette.light;