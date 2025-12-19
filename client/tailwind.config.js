/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Legacy colors (keep for backwards compatibility)
                'poo-brown': '#654321',
                'poo-light': '#8B4513',
                'water-blue': '#1e90ff',

                // New design system colors
                'primary': {
                    DEFAULT: '#8B4513',
                    light: '#A0522D',
                    dark: '#654321',
                },
                'secondary': {
                    DEFAULT: '#4682B4',
                    light: '#87CEEB',
                    dark: '#2F5A7A',
                },
                'accent': {
                    DEFAULT: '#FFD700',
                    dark: '#DAA520',
                },
                'game': {
                    hit: '#DC143C',
                    miss: '#1E90FF',
                    sunk: '#654321',
                    success: '#32CD32',
                    error: '#FF6347',
                },
            },
            fontFamily: {
                heading: ['Fredoka One', 'cursive'],
                body: ['Quicksand', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
