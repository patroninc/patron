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

const blogPosts = defineCollection({
  loader: glob({
    pattern: "**/*.mdx",
    base: "./src/content/blog-posts",
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: z.string(),
      author: z.string().optional(),
      createdAt: z.date().nullish(),
      lastUpdatedAt: z.date().nullish(),
      ogSection: z.string().optional(),
      isDraft: z.boolean(),
      categories: z.array(z.string()),
      coverImage: image(),
    }),
});

const blogCategories = defineCollection({
  loader: glob({
    pattern: "**/*.yaml",
    base: "./src/content/blog-categories",
  }),
  schema: () =>
    z.object({
      name: z.string(),
    }),
});

export const collections = {
  testimonials,
  blogPosts,
  blogCategories,
};
