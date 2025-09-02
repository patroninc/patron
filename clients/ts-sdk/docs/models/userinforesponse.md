# UserInfoResponse

Simplified user information for public API responses

## Example Usage

```typescript
import { UserInfoResponse } from "patronts/models";

let value: UserInfoResponse = {
  createdAt: new Date("2023-01-01T00:00:00"),
  email: "user@example.com",
  id: "d290f1ee-6c54-4b01-90e6-d701748f0851",
};
```

## Fields

| Field                                                                                         | Type                                                                                          | Required                                                                                      | Description                                                                                   | Example                                                                                       |
| --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `createdAt`                                                                                   | [Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) | :heavy_minus_sign:                                                                            | Registration date and time                                                                    | 2023-01-01T00:00:00                                                                           |
| `email`                                                                                       | *string*                                                                                      | :heavy_check_mark:                                                                            | User's current email address                                                                  | user@example.com                                                                              |
| `id`                                                                                          | *string*                                                                                      | :heavy_check_mark:                                                                            | User identifier for API responses                                                             | d290f1ee-6c54-4b01-90e6-d701748f0851                                                          |