# UserInfo

User information for API responses and internal use

## Example Usage

```typescript
import { UserInfo } from "patronts/models";

let value: UserInfo = {
  authProvider: "email",
  avatarUrl: "https://example.com/avatar.jpg",
  createdAt: new Date("2023-01-01T00:00:00"),
  displayName: "John Doe",
  email: "user@example.com",
  emailVerified: true,
  id: "a7b8c9d0-1234-5678-a123-567890123456",
  lastLogin: new Date("2023-01-02T12:00:00"),
};
```

## Fields

| Field                                                                                         | Type                                                                                          | Required                                                                                      | Description                                                                                   | Example                                                                                       |
| --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `authProvider`                                                                                | [models.AuthProvider](../models/authprovider.md)                                              | :heavy_check_mark:                                                                            | Authentication provider types supported by the system                                         |                                                                                               |
| `avatarUrl`                                                                                   | *string*                                                                                      | :heavy_minus_sign:                                                                            | URL to user's avatar image                                                                    | https://example.com/avatar.jpg                                                                |
| `createdAt`                                                                                   | [Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) | :heavy_minus_sign:                                                                            | User account creation timestamp                                                               | 2023-01-01T00:00:00Z                                                                          |
| `displayName`                                                                                 | *string*                                                                                      | :heavy_minus_sign:                                                                            | User's display name                                                                           | John Doe                                                                                      |
| `email`                                                                                       | *string*                                                                                      | :heavy_check_mark:                                                                            | User's registered email address                                                               | user@example.com                                                                              |
| `emailVerified`                                                                               | *boolean*                                                                                     | :heavy_check_mark:                                                                            | Whether the user's email has been verified                                                    | true                                                                                          |
| `id`                                                                                          | *string*                                                                                      | :heavy_check_mark:                                                                            | User's unique identifier                                                                      | a7b8c9d0-1234-5678-a123-567890123456                                                          |
| `lastLogin`                                                                                   | [Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) | :heavy_minus_sign:                                                                            | Timestamp of user's last login                                                                | 2023-01-02T12:00:00Z                                                                          |