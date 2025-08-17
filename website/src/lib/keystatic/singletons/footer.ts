import { singleton, fields } from "@keystatic/core";
import { action } from "../shared/action";

export const footer = singleton({
  label: "Footer",
  path: "src/content/singles/footer/",
  schema: {
    logo: fields.object({
      image: fields.image({
        label: "Logo",
        description: "Footer logo image",
        directory: "src/assets/images",
        publicPath: "/src/assets/images/",
      }),
      alt: fields.text({
        label: "Logo Alt Text",
        description: "Alternative text for the logo",
      }),
    }),
    tagline: fields.text({
      label: "Tagline",
      description: "Short tagline or company description",
    }),
    navigationSections: fields.array(
      fields.object({
        title: fields.text({
          label: "Section Title",
          validation: { isRequired: true },
        }),
        links: fields.array(
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
            label: "Links",
            itemLabel: (props) => props.fields.label.value || "Link",
          },
        ),
      }),
      {
        label: "Navigation Sections",
        itemLabel: (props) => props.fields.title.value || "Section",
      },
    ),
    contact: fields.object({
      title: fields.text({
        label: "Contact Section Title",
        defaultValue: "Contact",
      }),
      email: fields.text({
        label: "Email Address",
        description: "Contact email address",
      }),
      phone: fields.text({
        label: "Phone Number",
        description: "Contact phone number",
      }),
      address: fields.text({
        label: "Address",
        description: "Physical address",
        multiline: true,
      }),
    }),
    socialMedia: fields.array(
      fields.object({
        platform: fields.select({
          label: "Platform",
          options: [
            { value: "github", label: "GitHub" },
            { value: "twitter", label: "Twitter/X" },
            { value: "linkedin", label: "LinkedIn" },
            { value: "youtube", label: "YouTube" },
            { value: "facebook", label: "Facebook" },
            { value: "instagram", label: "Instagram" },
            { value: "discord", label: "Discord" },
            { value: "twitch", label: "Twitch" },
          ],
          defaultValue: "github",
        }),
        url: fields.text({
          label: "URL",
          validation: { isRequired: true },
        }),
        label: fields.text({
          label: "Accessible Label",
          description: "Screen reader label for the social media link",
        }),
      }),
      {
        label: "Social Media Links",
        itemLabel: (props) => props.fields.platform.value || "Social Link",
      },
    ),
    copyright: fields.text({
      label: "Copyright Text",
      description: "Copyright notice text",
      defaultValue: "© 2025 Patron Inc. All rights reserved.",
    }),
    bottomLinks: fields.array(
      fields.object({
        label: fields.text({
          label: "Link Label",
          validation: { isRequired: true },
        }),
        href: fields.text({
          label: "URL",
          validation: { isRequired: true },
        }),
      }),
      {
        label: "Bottom Links",
        description: "Legal links like Privacy Policy, Terms of Service, etc.",
        itemLabel: (props) => props.fields.label.value || "Link",
      },
    ),
  },
});
