import { collection, fields } from "@keystatic/core";

export const testimonials = collection({
  label: "Testimonials",
  path: "src/content/testimonials/*/",
  slugField: "author",
  schema: {
    quote: fields.text({
      label: "Quote",
      multiline: true,
      validation: { isRequired: true },
    }),
    author: fields.slug({
      name: { label: "Author" },
    }),
    image: fields.image({
      label: "Profile logo",
      directory: "src/assets/images/testimonials",
      publicPath: "/src/assets/images/testimonials/",
    }),
    order: fields.number({
      label: "Order",
    }),
  },
});
