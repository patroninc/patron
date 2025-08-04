// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import keystatic from "@keystatic/astro";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import devtoolsJson from "vite-plugin-devtools-json";
import icon from "astro-icon";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://www.patron.com",
  integrations: [
    react(),
    ...(process.env.SKIP_KEYSTATIC ? [] : [keystatic()]),
    icon(),
    mdx({
      shikiConfig: {
        theme: "nord",
      },
    }),
    sitemap(),
  ],
  vite: {
    resolve: {
      alias: {
        "@": "/src",
      },
    },
    plugins: [tailwindcss(), devtoolsJson()],
  },
  devToolbar: {
    enabled: false,
  },
  image: {
    domains: ["127.0.0.1"],
  },
});
