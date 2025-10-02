# UpdatePostRequest

Request payload for updating post content, metadata, or status

## Example Usage

```typescript
import { UpdatePostRequest } from "patronts/models";

let value: UpdatePostRequest = {
  audioFileId: "c3d4e5f6-7890-1234-cdef-123456789012",
  content: "Updated content for the first episode with more details...",
  isPublished: true,
  postNumber: 2,
  slug: "episode-1-updated",
  thumbnailUrl: "https://example.com/new-thumbnail.jpg",
  title: "Episode 1: Getting Started (Updated)",
  videoFileId: "d4e5f6a7-8901-2345-def0-234567890123",
};
```

## Fields

| Field                                                      | Type                                                       | Required                                                   | Description                                                | Example                                                    |
| ---------------------------------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------- |
| `audioFileId`                                              | *string*                                                   | :heavy_minus_sign:                                         | Updated audio file reference for the post                  | c3d4e5f6-7890-1234-cdef-123456789012                       |
| `content`                                                  | *string*                                                   | :heavy_minus_sign:                                         | Updated post content text (optional)                       | Updated content for the first episode with more details... |
| `isPublished`                                              | *boolean*                                                  | :heavy_minus_sign:                                         | Change the publication visibility of this post             | true                                                       |
| `postNumber`                                               | *number*                                                   | :heavy_minus_sign:                                         | Updated sequential number within the series (optional)     | 2                                                          |
| `slug`                                                     | *string*                                                   | :heavy_minus_sign:                                         | New URL-friendly slug for the post (optional)              | episode-1-updated                                          |
| `thumbnailUrl`                                             | *string*                                                   | :heavy_minus_sign:                                         | Replace the post's cover image with a new URL              | https://example.com/new-thumbnail.jpg                      |
| `title`                                                    | *string*                                                   | :heavy_minus_sign:                                         | New title for the post (optional)                          | Episode 1: Getting Started (Updated)                       |
| `videoFileId`                                              | *string*                                                   | :heavy_minus_sign:                                         | Updated video file reference for the post                  | d4e5f6a7-8901-2345-def0-234567890123                       |