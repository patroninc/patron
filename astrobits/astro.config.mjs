import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  build: {
    inlineStylesheets: "never",
  },

  vite: {
    plugins: [tailwindcss()],
  },
});