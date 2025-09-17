# UpdateUserInfoRequest

Request body for updating user information

## Example Usage

```typescript
import { UpdateUserInfoRequest } from "patronts/models";

let value: UpdateUserInfoRequest = {
  avatarUrl: "https://example.com/new-avatar.jpg",
  displayName: "New Display Name",
};
```

## Fields

| Field                             | Type                              | Required                          | Description                       |
| --------------------------------- | --------------------------------- | --------------------------------- | --------------------------------- |
| `avatarUrl`                       | *string*                          | :heavy_minus_sign:                | Updated avatar URL for the user   |
| `displayName`                     | *string*                          | :heavy_minus_sign:                | Updated display name for the user |