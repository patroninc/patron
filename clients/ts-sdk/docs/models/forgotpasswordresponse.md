# ForgotPasswordResponse

Response for password reset request

## Example Usage

```typescript
import { ForgotPasswordResponse } from "patronts/models";

let value: ForgotPasswordResponse = {
  message:
    "If the email exists in our system, a password reset link has been sent.",
};
```

## Fields

| Field                                 | Type                                  | Required                              | Description                           |
| ------------------------------------- | ------------------------------------- | ------------------------------------- | ------------------------------------- |
| `message`                             | *string*                              | :heavy_check_mark:                    | Password reset request status message |