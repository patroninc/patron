import { config } from "@keystatic/core";
import { testimonials } from "@lib/keystatic/collections/testimonials";
import { homepage } from "@lib/keystatic/singletons/homepage";

export default config({
  storage: {
    kind: "local",
  },
  collections: {
    testimonials,
  },
  singletons: {
    homepage,
  },
});
