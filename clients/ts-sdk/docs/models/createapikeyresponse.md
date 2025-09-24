# CreateApiKeyResponse

Response when creating a new API key - includes the actual key value

## Example Usage

```typescript
import { CreateApiKeyResponse } from "patronts/models";

let value: CreateApiKeyResponse = {
  createdAt: new Date("2023-01-01T00:00:00Z"),
  expiresAt: new Date("2024-01-01T00:00:00Z"),
  id: "d290f1ee-6c54-4b01-90e6-d701748f0851",
  isActive: true,
  key: "pk_live_1234567890abcdef",
  keyPrefix: "pk_live_",
  name: "Production API Key",
  permissions: [
    "read:posts",
    "write:posts",
  ],
};
```

## Fields

| Field                                                                                         | Type                                                                                          | Required                                                                                      | Description                                                                                   | Example                                                                                       |
| --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `createdAt`                                                                                   | [Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) | :heavy_minus_sign:                                                                            | Timestamp of when the API key was just created                                                | 2023-01-01T00:00:00Z                                                                          |
| `expiresAt`                                                                                   | [Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) | :heavy_minus_sign:                                                                            | Key expiration date (when provided)                                                           | 2024-01-01T00:00:00Z                                                                          |
| `id`                                                                                          | *string*                                                                                      | :heavy_check_mark:                                                                            | UUID of the newly created API key                                                             | a1b2c3d4-5e6f-7890-abcd-ef1234567890                                                          |
| `isActive`                                                                                    | *boolean*                                                                                     | :heavy_check_mark:                                                                            | Initial active status of the new API key                                                      | true                                                                                          |
| `key`                                                                                         | *string*                                                                                      | :heavy_check_mark:                                                                            | The actual API key value (only shown once during creation)                                    | pk_live_1234567890abcdef                                                                      |
| `keyPrefix`                                                                                   | *string*                                                                                      | :heavy_check_mark:                                                                            | Prefix portion of the newly generated key                                                     | pk_live_                                                                                      |
| `name`                                                                                        | *string*                                                                                      | :heavy_check_mark:                                                                            | Display name shown for this API key                                                           | Production API Key                                                                            |
| `permissions`                                                                                 | *string*[]                                                                                    | :heavy_check_mark:                                                                            | Permissions assigned to the new API key                                                       | [<br/>"read:posts",<br/>"write:posts"<br/>]                                                   |