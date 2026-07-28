/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}", // Nếu dùng App Router
    "./pages/**/*.{js,ts,jsx,tsx,mdx}", // Nếu dùng Pages Router
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}", // Nếu nằm trong thư mục src
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}