// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import keystatic from "@keystatic/astro";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import devtoolsJson from "vite-plugin-devtools-json";

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [
      tailwindcss(),
      mdx({
        shikiConfig: {
          theme: "nord",
        },
      }),
      devtoolsJson(),
    ],
  },

  integrations: [react(), mdx(), keystatic()],
});
