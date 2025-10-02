# CreateSeriesRequest

Request payload for creating a new series with content and metadata

## Example Usage

```typescript
import { CreateSeriesRequest } from "patronts/models";

let value: CreateSeriesRequest = {
  category: "Technology",
  coverImageUrl: "https://example.com/cover.jpg",
  description: "A weekly podcast about technology and innovation",
  slug: "my-awesome-podcast",
  title: "My Awesome Podcast",
};
```

## Fields

| Field                                                    | Type                                                     | Required                                                 | Description                                              | Example                                                  |
| -------------------------------------------------------- | -------------------------------------------------------- | -------------------------------------------------------- | -------------------------------------------------------- | -------------------------------------------------------- |
| `category`                                               | *string*                                                 | :heavy_minus_sign:                                       | Category or genre of the series (optional)               | Technology                                               |
| `coverImageUrl`                                          | *string*                                                 | :heavy_minus_sign:                                       | Banner image URL for the series homepage                 | https://example.com/cover.jpg                            |
| `description`                                            | *string*                                                 | :heavy_minus_sign:                                       | Description of the series content and purpose (optional) | A weekly podcast about technology and innovation         |
| `slug`                                                   | *string*                                                 | :heavy_check_mark:                                       | Unique URL path segment for the new series               | my-awesome-podcast                                       |
| `title`                                                  | *string*                                                 | :heavy_check_mark:                                       | Name for the new series being created                    | My Awesome Podcast                                       |