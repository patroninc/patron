# ApiKeyResponse

API response model for API keys (excludes sensitive hash)

## Example Usage

```typescript
import { ApiKeyResponse } from "patronts/models";

let value: ApiKeyResponse = {
  createdAt: new Date("2023-01-01T00:00:00Z"),
  expiresAt: new Date("2024-01-01T00:00:00Z"),
  id: "d290f1ee-6c54-4b01-90e6-d701748f0851",
  isActive: true,
  keyPrefix: "pk_live_",
  lastUsedAt: new Date("2023-01-01T12:00:00Z"),
  name: "Production API Key",
  permissions: [
    "read:posts",
    "write:posts",
  ],
  updatedAt: new Date("2023-01-01T12:00:00Z"),
  userId: "b2c3d4e5-6f78-9012-bcde-f12345678901",
};
```

## Fields

| Field                                                                                         | Type                                                                                          | Required                                                                                      | Description                                                                                   | Example                                                                                       |
| --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `createdAt`                                                                                   | [Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) | :heavy_minus_sign:                                                                            | When this API key was originally created                                                      | 2023-01-01T00:00:00Z                                                                          |
| `expiresAt`                                                                                   | [Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) | :heavy_minus_sign:                                                                            | Expiration timestamp after which key becomes invalid                                          | 2024-01-01T00:00:00Z                                                                          |
| `id`                                                                                          | *string*                                                                                      | :heavy_check_mark:                                                                            | Unique identifier for this API key in responses                                               | a1b2c3d4-5e6f-7890-abcd-ef1234567890                                                          |
| `isActive`                                                                                    | *boolean*                                                                                     | :heavy_check_mark:                                                                            | Current activation status of this API key                                                     | true                                                                                          |
| `keyPrefix`                                                                                   | *string*                                                                                      | :heavy_check_mark:                                                                            | Key prefix for visual identification in API key lists                                         | pk_live_                                                                                      |
| `lastUsedAt`                                                                                  | [Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) | :heavy_minus_sign:                                                                            | Timestamp when the key was last used                                                          | 2023-01-01T12:00:00Z                                                                          |
| `name`                                                                                        | *string*                                                                                      | :heavy_check_mark:                                                                            | Descriptive name for this API key                                                             | Production API Key                                                                            |
| `permissions`                                                                                 | *string*[]                                                                                    | :heavy_check_mark:                                                                            | Permissions granted to this API key for resource access                                       | [<br/>"read:posts",<br/>"write:posts"<br/>]                                                   |
| `updatedAt`                                                                                   | [Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) | :heavy_minus_sign:                                                                            | API key last update timestamp                                                                 | 2023-01-01T12:00:00Z                                                                          |
| `userId`                                                                                      | *string*                                                                                      | :heavy_check_mark:                                                                            | Owner user identifier                                                                         | b2c3d4e5-6f78-9012-bcde-f12345678901                                                          |