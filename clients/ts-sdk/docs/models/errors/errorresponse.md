# ErrorResponse

Standard JSON error response structure for API endpoints.

## Example Usage

```typescript
import { ErrorResponse } from "patronts/models/errors";

// No examples available for this model
```

## Fields

| Field                                         | Type                                          | Required                                      | Description                                   |
| --------------------------------------------- | --------------------------------------------- | --------------------------------------------- | --------------------------------------------- |
| `code`                                        | *string*                                      | :heavy_minus_sign:                            | Optional error code for programmatic handling |
| `error`                                       | *string*                                      | :heavy_check_mark:                            | Error message describing what went wrong      |