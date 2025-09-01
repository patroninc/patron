# ResetPasswordRequest

Request body for password reset confirmation

## Example Usage

```typescript
import { ResetPasswordRequest } from "patronts/models";

let value: ResetPasswordRequest = {
  newPassword: "newpassword123",
  token: "550e8400-e29b-41d4-a716-446655440000",
};
```

## Fields

| Field                               | Type                                | Required                            | Description                         |
| ----------------------------------- | ----------------------------------- | ----------------------------------- | ----------------------------------- |
| `newPassword`                       | *string*                            | :heavy_check_mark:                  | New password (minimum 8 characters) |
| `token`                             | *string*                            | :heavy_check_mark:                  | Password reset token                |