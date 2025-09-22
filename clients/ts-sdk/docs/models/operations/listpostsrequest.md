# ListPostsRequest

## Example Usage

```typescript
import { ListPostsRequest } from "patronts/models/operations";

let value: ListPostsRequest = {};
```

## Fields

| Field                                                     | Type                                                      | Required                                                  | Description                                               |
| --------------------------------------------------------- | --------------------------------------------------------- | --------------------------------------------------------- | --------------------------------------------------------- |
| `offset`                                                  | *string*                                                  | :heavy_minus_sign:                                        | UUID offset for cursor-based posts pagination             |
| `limit`                                                   | *number*                                                  | :heavy_minus_sign:                                        | Maximum number of posts to return (default: 50, max: 100) |
| `seriesId`                                                | *string*                                                  | :heavy_minus_sign:                                        | Filter posts by series ID                                 |