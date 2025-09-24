# UpdateApiKeyRequest

Request payload for updating an API key

## Example Usage

```typescript
import { UpdateApiKeyRequest } from "patronts/models";

let value: UpdateApiKeyRequest = {
  expiresAt: new Date("2024-06-01T00:00:00Z"),
  isActive: false,
  name: "Updated API Key Name",
  permissions: [
    "read:posts",
  ],
};
```

## Fields

| Field                                                                                         | Type                                                                                          | Required                                                                                      | Description                                                                                   | Example                                                                                       |
| --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `expiresAt`                                                                                   | [Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) | :heavy_minus_sign:                                                                            | Update the expiration date                                                                    | 2024-06-01T00:00:00Z                                                                          |
| `isActive`                                                                                    | *boolean*                                                                                     | :heavy_minus_sign:                                                                            | Change the active status of the key                                                           | false                                                                                         |
| `name`                                                                                        | *string*                                                                                      | :heavy_minus_sign:                                                                            | New name for the API key (optional)                                                           | Updated API Key Name                                                                          |
| `permissions`                                                                                 | *string*[]                                                                                    | :heavy_minus_sign:                                                                            | Updated permissions array (optional)                                                          | [<br/>"read:posts"<br/>]                                                                      |