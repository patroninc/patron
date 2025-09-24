# ListApiKeysRequest

## Example Usage

```typescript
import { ListApiKeysRequest } from "patronts/models/operations";

let value: ListApiKeysRequest = {};
```

## Fields

| Field                                                         | Type                                                          | Required                                                      | Description                                                   |
| ------------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------- |
| `offset`                                                      | *string*                                                      | :heavy_minus_sign:                                            | Starting point UUID for paginated API key results             |
| `limit`                                                       | *number*                                                      | :heavy_minus_sign:                                            | Number of API keys to return per page (default: 50, max: 100) |
| `isActive`                                                    | *boolean*                                                     | :heavy_minus_sign:                                            | Only show active or inactive API keys                         |