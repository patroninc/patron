# SeriesResponse

API response model for series

## Example Usage

```typescript
import { SeriesResponse } from "patronts/models";

let value: SeriesResponse = {
  category: "Technology",
  coverImageUrl: "https://example.com/cover.jpg",
  createdAt: new Date("2023-01-01T00:00:00Z"),
  description: "A weekly podcast about technology and innovation",
  id: "e5f6a7b8-9012-3456-ef01-345678901234",
  slug: "my-awesome-podcast",
  title: "My Awesome Podcast",
  updatedAt: new Date("2023-01-01T12:00:00Z"),
  userId: "f6a7b8c9-0123-4567-f012-456789012345",
};
```

## Fields

| Field                                                                                         | Type                                                                                          | Required                                                                                      | Description                                                                                   | Example                                                                                       |
| --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `category`                                                                                    | *string*                                                                                      | :heavy_minus_sign:                                                                            | Category or genre of the series                                                               | Technology                                                                                    |
| `coverImageUrl`                                                                               | *string*                                                                                      | :heavy_minus_sign:                                                                            | URL to the series cover image                                                                 | https://example.com/cover.jpg                                                                 |
| `createdAt`                                                                                   | [Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) | :heavy_minus_sign:                                                                            | Series creation timestamp                                                                     | 2023-01-01T00:00:00Z                                                                          |
| `description`                                                                                 | *string*                                                                                      | :heavy_minus_sign:                                                                            | Description of the series content and purpose                                                 | A weekly podcast about technology and innovation                                              |
| `id`                                                                                          | *string*                                                                                      | :heavy_check_mark:                                                                            | Series unique identifier                                                                      | e5f6a7b8-9012-3456-ef01-345678901234                                                          |
| `slug`                                                                                        | *string*                                                                                      | :heavy_check_mark:                                                                            | SEO-friendly URL identifier for the series                                                    | my-awesome-podcast                                                                            |
| `title`                                                                                       | *string*                                                                                      | :heavy_check_mark:                                                                            | Display name of the series                                                                    | My Awesome Podcast                                                                            |
| `updatedAt`                                                                                   | [Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) | :heavy_minus_sign:                                                                            | Series last update timestamp                                                                  | 2023-01-01T12:00:00Z                                                                          |
| `userId`                                                                                      | *string*                                                                                      | :heavy_check_mark:                                                                            | ID of the user who owns this series                                                           | f6a7b8c9-0123-4567-f012-456789012345                                                          |