import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

import mdx from "@astrojs/mdx";

export default defineConfig({
  build: {
    inlineStylesheets: "never",
  },

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [mdx()],
});
