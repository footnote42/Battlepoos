/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'poo-brown': '#654321', // Classic
                'poo-light': '#8B4513',
                'water-blue': '#1e90ff',
            }
        },
    },
    plugins: [],
}
