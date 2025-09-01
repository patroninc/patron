# LoginResponse

Response for successful user login

## Example Usage

```typescript
import { LoginResponse } from "patronts/models";

let value: LoginResponse = {
  message: "Login successful",
  user: {
    authProvider: "email",
    displayName: "John Doe",
    email: "user@example.com",
    emailVerified: true,
    id: "d290f1ee-6c54-4b01-90e6-d701748f0851",
  },
};
```

## Fields

| Field                                               | Type                                                | Required                                            | Description                                         |
| --------------------------------------------------- | --------------------------------------------------- | --------------------------------------------------- | --------------------------------------------------- |
| `message`                                           | *string*                                            | :heavy_check_mark:                                  | Success message                                     |
| `user`                                              | [models.UserInfo](../models/userinfo.md)            | :heavy_check_mark:                                  | User information for API responses and internal use |