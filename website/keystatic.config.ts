import { config } from "@keystatic/core";
import { testimonials } from "@lib/keystatic/collections/testimonials";
import { homepage } from "@lib/keystatic/singletons/homepage";
import { nav } from "@lib/keystatic/singletons/nav";
import { footer } from "@lib/keystatic/singletons/footer";
import { blog } from "@lib/keystatic/singletons/blog";
import { blogCategories } from "@lib/keystatic/collections/blog-categories";
import { blogPosts } from "@lib/keystatic/collections/blog-posts";

export default config({
  storage: {
    kind: "local",
  },
  collections: {
    testimonials,
    blogCategories,
    blogPosts,
  },
  singletons: {
    homepage,
    nav,
    footer,
    blog,
  },
});
