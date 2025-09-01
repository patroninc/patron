# UserInfo

User information for API responses and internal use

## Example Usage

```typescript
import { UserInfo } from "patronts/models";

let value: UserInfo = {
  authProvider: "email",
  email: "Sierra12@hotmail.com",
  emailVerified: true,
  id: "27236551-1a9d-45ac-b9d3-9761e25664dc",
};
```

## Fields

| Field                                                                                         | Type                                                                                          | Required                                                                                      | Description                                                                                   |
| --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `authProvider`                                                                                | [models.AuthProvider](../models/authprovider.md)                                              | :heavy_check_mark:                                                                            | Authentication provider types supported by the system                                         |
| `avatarUrl`                                                                                   | *string*                                                                                      | :heavy_minus_sign:                                                                            | URL to user's avatar image                                                                    |
| `createdAt`                                                                                   | [Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) | :heavy_minus_sign:                                                                            | Timestamp when user was created                                                               |
| `displayName`                                                                                 | *string*                                                                                      | :heavy_minus_sign:                                                                            | User's display name                                                                           |
| `email`                                                                                       | *string*                                                                                      | :heavy_check_mark:                                                                            | User's email address                                                                          |
| `emailVerified`                                                                               | *boolean*                                                                                     | :heavy_check_mark:                                                                            | Whether the user's email has been verified                                                    |
| `id`                                                                                          | *string*                                                                                      | :heavy_check_mark:                                                                            | Unique user identifier                                                                        |
| `lastLogin`                                                                                   | [Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) | :heavy_minus_sign:                                                                            | Timestamp of user's last login                                                                |