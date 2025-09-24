# CreateApiKeyRequest

Request payload for creating a new API key

## Example Usage

```typescript
import { CreateApiKeyRequest } from "patronts/models";

let value: CreateApiKeyRequest = {
  expiresAt: new Date("2024-01-01T00:00:00Z"),
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
| `expiresAt`                                                                                   | [Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) | :heavy_minus_sign:                                                                            | When the API key should expire (optional)                                                     | 2024-01-01T00:00:00Z                                                                          |
| `name`                                                                                        | *string*                                                                                      | :heavy_check_mark:                                                                            | Name identifier for the new API key                                                           | Production API Key                                                                            |
| `permissions`                                                                                 | *string*[]                                                                                    | :heavy_minus_sign:                                                                            | Array of permissions to grant to this key                                                     | [<br/>"read:posts",<br/>"write:posts"<br/>]                                                   |