# ForgotPasswordRequest

Request body for password reset

## Example Usage

```typescript
import { ForgotPasswordRequest } from "patronts/models";

let value: ForgotPasswordRequest = {
  email: "user@example.com",
};
```

## Fields

| Field                                        | Type                                         | Required                                     | Description                                  | Example                                      |
| -------------------------------------------- | -------------------------------------------- | -------------------------------------------- | -------------------------------------------- | -------------------------------------------- |
| `email`                                      | *string*                                     | :heavy_check_mark:                           | Email address to send password reset link to | user@example.com                             |