import { singleton, fields } from "@keystatic/core";

export const nav = singleton({
  label: "Nav",
  path: "src/content/singles/nav/",
  schema: {
    logo: fields.object({
      image: fields.image({
        label: "Logo",
        description: "Navigation logo image",
        directory: "src/assets/images",
        publicPath: "/src/assets/images/",
      }),
      alt: fields.text({
        label: "Logo Alt Text",
        description: "Alternative text for the logo",
      }),
      href: fields.text({
        label: "Logo Link",
        description: "URL when logo is clicked (usually homepage)",
        defaultValue: "/",
      }),
    }),
    navigationLinks: fields.array(
      fields.object({
        label: fields.text({
          label: "Link Label",
          validation: { isRequired: true },
        }),
        href: fields.text({
          label: "URL",
          validation: { isRequired: true },
        }),
        newTab: fields.checkbox({
          label: "Open in new tab",
        }),
      }),
      {
        label: "Navigation Links",
        description: "Main navigation menu items",
        itemLabel: (props) => props.fields.label.value || "Link",
      },
    ),
    ctaButton: fields.object({
      enabled: fields.checkbox({
        label: "Show CTA Button",
        defaultValue: true,
      }),
      label: fields.text({
        label: "Button Label",
        validation: {
          isRequired: true,
        },
      }),
      href: fields.text({
        label: "Button URL",
      }),
      id: fields.text({
        label: "Button ID",
        description: "Optional ID attribute for the button",
        defaultValue: "nav-cta-button",
      }),
      newTab: fields.checkbox({
        label: "Open in new tab",
      }),
      variant: fields.select({
        label: "Button Variant",
        description: "The style variant of the button",
        options: [
          { value: "primary", label: "Primary" },
          { value: "secondary", label: "Secondary" },
        ],
        defaultValue: "primary",
      }),
    }),
  },
});
