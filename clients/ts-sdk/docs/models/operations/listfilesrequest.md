# ListFilesRequest

## Example Usage

```typescript
import { ListFilesRequest } from "patronts/models/operations";

let value: ListFilesRequest = {};
```

## Fields

| Field                                                     | Type                                                      | Required                                                  | Description                                               |
| --------------------------------------------------------- | --------------------------------------------------------- | --------------------------------------------------------- | --------------------------------------------------------- |
| `offset`                                                  | *string*                                                  | :heavy_minus_sign:                                        | UUID offset for cursor-based files pagination             |
| `limit`                                                   | *number*                                                  | :heavy_minus_sign:                                        | Maximum number of files to return (default: 50, max: 100) |