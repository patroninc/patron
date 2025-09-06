# CheckEmailRequest

Request body for checking if email exists

## Example Usage

```typescript
import { CheckEmailRequest } from "patronts/models";

let value: CheckEmailRequest = {
  email: "user@example.com",
};
```

## Fields

| Field                  | Type                   | Required               | Description            | Example                |
| ---------------------- | ---------------------- | ---------------------- | ---------------------- | ---------------------- |
| `email`                | *string*               | :heavy_check_mark:     | Email address to check | user@example.com       |