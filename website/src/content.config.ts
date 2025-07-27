import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

const testimonials = defineCollection({
  loader: glob({
    pattern: "**/*.yaml",
    base: "./src/content/testimonials",
  }),
  schema: ({ image }) =>
    z.object({
      author: z.string(),
      quote: z.string(),
      image: image().optional(),
      order: z.number().optional(),
    }),
});

export const collections = {
  testimonials,
};
