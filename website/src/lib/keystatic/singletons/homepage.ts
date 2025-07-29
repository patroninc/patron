import { fields, singleton } from "@keystatic/core";
import { metadata } from "../shared/metadata";
import { overrideActions } from "../shared/override-actions";

export const homepage = singleton({
  label: "Homepage",
  path: "src/content/singles/homepage/",
  schema: {
    metadata,

    hero: fields.object(
      {
        title: fields.object({
          text: fields.text({
            label: "Text",
          }),
          emphasized: fields.text({
            label: "Emphasized text",
          }),
        }),
        description: fields.text({
          label: "Description",
        }),
        ctaButtonText: fields.text({
          label: "CTA Button Text",
        }),
        emailPlaceholder: fields.text({
          label: "Email Placeholder",
        }),
        overrideActions,
      },
      {
        label: "Hero",
      },
    ),

    features: fields.object(
      {
        title: fields.text({
          label: "Title",
        }),
        features: fields.array(
          fields.object({
            title: fields.text({
              label: "Title",
              validation: { isRequired: true },
            }),
            description: fields.text({
              label: "Description",
              validation: { isRequired: true },
              multiline: true,
            }),
          }),
          { label: "Items", itemLabel: (i) => i.fields.title.value },
        ),
      },
      { label: "Features" },
    ),

    steps: fields.object(
      {
        title: fields.text({
          label: "Title",
        }),
        steps: fields.array(
          fields.object({
            title: fields.text({
              label: "Title",
              validation: { isRequired: true },
            }),
            description: fields.text({
              label: "Description",
              validation: { isRequired: true },
              multiline: true,
            }),
          }),
          { label: "Items", itemLabel: (i) => i.fields.title.value },
        ),
      },
      {
        label: "Steps",
      },
    ),
    faq: fields.object(
      {
        title: fields.text({
          label: "Title",
        }),
        items: fields.array(
          fields.object({
            question: fields.text({
              label: "Question",
              validation: { isRequired: true },
            }),
            answer: fields.text({
              label: "Answer",
              validation: { isRequired: true },
              multiline: true,
            }),
          }),
          { label: "FAQ Items", itemLabel: (i) => i.fields.question.value },
        ),
      },
      {
        label: "FAQ",
      },
    ),
    cta: fields.object(
      {
        title: fields.text({
          label: "Title",
        }),
        description: fields.text({
          label: "Description",
        }),
        emailPlaceholder: fields.text({
          label: "Email Placeholder",
        }),
        overrideActions,
      },
      { label: "Call to Action" },
    ),
  },
});
