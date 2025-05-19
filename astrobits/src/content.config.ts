import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const components = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/data/components" }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    description: z.string(),
  }),
});

export const collections = { components };
