# UpdateSeriesRequest

Request payload for updating series content, metadata, or status

## Example Usage

```typescript
import { UpdateSeriesRequest } from "patronts/models";

let value: UpdateSeriesRequest = {
  category: "Technology",
  coverImageUrl: "https://example.com/new-cover.jpg",
  description: "An updated description with more details",
  slug: "my-updated-podcast",
  title: "My Updated Podcast",
};
```

## Fields

| Field                                              | Type                                               | Required                                           | Description                                        | Example                                            |
| -------------------------------------------------- | -------------------------------------------------- | -------------------------------------------------- | -------------------------------------------------- | -------------------------------------------------- |
| `category`                                         | *string*                                           | :heavy_minus_sign:                                 | Updated category or genre of the series (optional) | Technology                                         |
| `coverImageUrl`                                    | *string*                                           | :heavy_minus_sign:                                 | Update the series banner image with a new URL      | https://example.com/new-cover.jpg                  |
| `description`                                      | *string*                                           | :heavy_minus_sign:                                 | Updated description of the series (optional)       | An updated description with more details           |
| `slug`                                             | *string*                                           | :heavy_minus_sign:                                 | New URL-friendly slug for the series (optional)    | my-updated-podcast                                 |
| `title`                                            | *string*                                           | :heavy_minus_sign:                                 | New title for the series (optional)                | My Updated Podcast                                 |