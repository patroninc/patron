# PostResponse

API response model for posts

## Example Usage

```typescript
import { PostResponse } from "patronts/models";

let value: PostResponse = {
  audioFileId: "c3d4e5f6-7890-1234-cdef-123456789012",
  content: "Welcome to our first episode where we discuss the fundamentals...",
  createdAt: new Date("2023-01-01T00:00:00Z"),
  id: "d290f1ee-6c54-4b01-90e6-d701748f0851",
  isPremium: false,
  isPublished: true,
  postNumber: 1,
  seriesId: "b2c3d4e5-6f78-9012-bcde-f12345678901",
  slug: "episode-1-getting-started",
  thumbnailUrl: "https://example.com/thumbnail.jpg",
  title: "Episode 1: Getting Started",
  updatedAt: new Date("2023-01-01T12:00:00Z"),
  videoFileId: "d4e5f6a7-8901-2345-def0-234567890123",
};
```

## Fields

| Field                                                                                         | Type                                                                                          | Required                                                                                      | Description                                                                                   | Example                                                                                       |
| --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `audioFileId`                                                                                 | *string*                                                                                      | :heavy_minus_sign:                                                                            | ID of associated audio file                                                                   | c3d4e5f6-7890-1234-cdef-123456789012                                                          |
| `content`                                                                                     | *string*                                                                                      | :heavy_check_mark:                                                                            | Post body text and content                                                                    | Welcome to our first episode where we discuss the fundamentals...                             |
| `createdAt`                                                                                   | [Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) | :heavy_minus_sign:                                                                            | Post creation timestamp                                                                       | 2023-01-01T00:00:00Z                                                                          |
| `id`                                                                                          | *string*                                                                                      | :heavy_check_mark:                                                                            | Post's unique identifier                                                                      | a1b2c3d4-5e6f-7890-abcd-ef1234567890                                                          |
| `isPremium`                                                                                   | *boolean*                                                                                     | :heavy_check_mark:                                                                            | Whether the post requires premium access                                                      | false                                                                                         |
| `isPublished`                                                                                 | *boolean*                                                                                     | :heavy_check_mark:                                                                            | Whether the post is published and visible to users                                            | true                                                                                          |
| `postNumber`                                                                                  | *number*                                                                                      | :heavy_check_mark:                                                                            | Position number for ordering this post within its parent series                               | 1                                                                                             |
| `seriesId`                                                                                    | *string*                                                                                      | :heavy_check_mark:                                                                            | Parent series identifier                                                                      | b2c3d4e5-6f78-9012-bcde-f12345678901                                                          |
| `slug`                                                                                        | *string*                                                                                      | :heavy_check_mark:                                                                            | SEO-friendly URL identifier for the post                                                      | episode-1-getting-started                                                                     |
| `thumbnailUrl`                                                                                | *string*                                                                                      | :heavy_minus_sign:                                                                            | URL to the post's thumbnail image                                                             | https://example.com/thumbnail.jpg                                                             |
| `title`                                                                                       | *string*                                                                                      | :heavy_check_mark:                                                                            | Post display title                                                                            | Episode 1: Getting Started                                                                    |
| `updatedAt`                                                                                   | [Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) | :heavy_minus_sign:                                                                            | Post last update timestamp                                                                    | 2023-01-01T12:00:00Z                                                                          |
| `videoFileId`                                                                                 | *string*                                                                                      | :heavy_minus_sign:                                                                            | ID of associated video file                                                                   | d4e5f6a7-8901-2345-def0-234567890123                                                          |