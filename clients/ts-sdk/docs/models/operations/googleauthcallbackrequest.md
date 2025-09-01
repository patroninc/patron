# GoogleAuthCallbackRequest

## Example Usage

```typescript
import { GoogleAuthCallbackRequest } from "patronts/models/operations";

let value: GoogleAuthCallbackRequest = {
  code: "<value>",
  state: "Colorado",
};
```

## Fields

| Field                               | Type                                | Required                            | Description                         |
| ----------------------------------- | ----------------------------------- | ----------------------------------- | ----------------------------------- |
| `code`                              | *string*                            | :heavy_check_mark:                  | Authorization code from Google      |
| `state`                             | *string*                            | :heavy_check_mark:                  | State parameter for CSRF protection |