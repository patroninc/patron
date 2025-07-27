import { config } from "@keystatic/core";
import { testimonials } from "@lib/keystatic/collections/testimonials";
import { homepage } from "@lib/keystatic/singletons/homepage";
import { nav } from "@lib/keystatic/singletons/nav";
import { footer } from "@lib/keystatic/singletons/footer";

export default config({
  storage: {
    kind: "local",
  },
  collections: {
    testimonials,
  },
  singletons: {
    homepage,
    nav,
    footer,
  },
});
