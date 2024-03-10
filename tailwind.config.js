/** @type {import('tailwindcss').Config} */
const { fontFamily } = require('tailwindcss/defaultTheme')
const colors = require('tailwindcss/colors')

const shade = colors.slate
const linkbase = colors.sky

module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,md}',
    './layouts/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        header: ['"Roboto Condensed"', ...fontFamily.sans],
        sans: ['"Source Sans Pro"', ...fontFamily.sans],
      },
      colors: {
        pagebg: {
          dark: shade['900'],
          light: shade['100'],
        },
        headertext: {
          dark: colors.slate['300'],
          light: colors.slate['700'],
        },
        shadebg: { dark: shade['800'], light: shade['200'] },
        shadetext: { dark: shade['400'], light: shade['600'] },
        border: { dark: shade['800'], light: shade['200'] },
        text: { dark: shade['400'], light: shade['500'] },
        date: { dark: shade['500'], light: shade['500'] },
        themetoggle: {
          dark: linkbase['700'],
          light: colors.orange['400'],
          hover: {
            light: colors.orange['400'],
            dark: linkbase['600'],
          },
        },
        mid: { dark: shade['400'], light: shade['800'] },
        header: { dark: shade['200'], light: shade['900'] },
        link: {
          base: { dark: linkbase['600'], light: linkbase['700'] },
          visited: { dark: linkbase['600'], light: linkbase['700'] },
          hover: { dark: linkbase['300'], light: linkbase['800'] },
        },
      },
    },
  },
  darkMode: 'class',
  plugins: [require('@tailwindcss/line-clamp')],
}
