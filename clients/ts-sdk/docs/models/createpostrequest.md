# CreatePostRequest

Request payload for creating a new post with content and metadata

## Example Usage

```typescript
import { CreatePostRequest } from "patronts/models";

let value: CreatePostRequest = {
  audioFileId: "c3d4e5f6-7890-1234-cdef-123456789012",
  content: "Welcome to our first episode where we discuss the fundamentals...",
  isPublished: false,
  postNumber: 1,
  seriesId: "b2c3d4e5-6f78-9012-bcde-f12345678901",
  slug: "episode-1-getting-started",
  thumbnailUrl: "https://example.com/thumbnail.jpg",
  title: "Episode 1: Getting Started",
  videoFileId: "d4e5f6a7-8901-2345-def0-234567890123",
};
```

## Fields

| Field                                                             | Type                                                              | Required                                                          | Description                                                       | Example                                                           |
| ----------------------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------- |
| `audioFileId`                                                     | *string*                                                          | :heavy_minus_sign:                                                | Optional audio file attachment for the post                       | c3d4e5f6-7890-1234-cdef-123456789012                              |
| `content`                                                         | *string*                                                          | :heavy_check_mark:                                                | Full content of the post                                          | Welcome to our first episode where we discuss the fundamentals... |
| `isPublished`                                                     | *boolean*                                                         | :heavy_minus_sign:                                                | Publish this post immediately upon creation                       | false                                                             |
| `postNumber`                                                      | *number*                                                          | :heavy_check_mark:                                                | Episode or post number for sequencing content within the series   | 1                                                                 |
| `seriesId`                                                        | *string*                                                          | :heavy_check_mark:                                                | Series to add this post to                                        | b2c3d4e5-6f78-9012-bcde-f12345678901                              |
| `slug`                                                            | *string*                                                          | :heavy_check_mark:                                                | Unique URL path segment for the new post                          | episode-1-getting-started                                         |
| `thumbnailUrl`                                                    | *string*                                                          | :heavy_minus_sign:                                                | Cover image URL for the post preview                              | https://example.com/thumbnail.jpg                                 |
| `title`                                                           | *string*                                                          | :heavy_check_mark:                                                | Post title for display                                            | Episode 1: Getting Started                                        |
| `videoFileId`                                                     | *string*                                                          | :heavy_minus_sign:                                                | Optional video file attachment for the post                       | d4e5f6a7-8901-2345-def0-234567890123                              |