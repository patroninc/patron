# ListSeriesRequest

## Example Usage

```typescript
import { ListSeriesRequest } from "patronts/models/operations";

let value: ListSeriesRequest = {};
```

## Fields

| Field                                                      | Type                                                       | Required                                                   | Description                                                |
| ---------------------------------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------- |
| `offset`                                                   | *string*                                                   | :heavy_minus_sign:                                         | UUID offset for cursor-based series pagination             |
| `limit`                                                    | *number*                                                   | :heavy_minus_sign:                                         | Maximum number of series to return (default: 50, max: 100) |