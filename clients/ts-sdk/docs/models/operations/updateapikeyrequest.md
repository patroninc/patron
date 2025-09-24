# UpdateApiKeyRequest

## Example Usage

```typescript
import { UpdateApiKeyRequest } from "patronts/models/operations";

let value: UpdateApiKeyRequest = {
  apiKeyId: "47e0bc6d-f041-4b28-b3e5-f3d82d495de6",
  updateApiKeyRequest: {
    expiresAt: new Date("2024-06-01T00:00:00Z"),
    isActive: false,
    name: "Updated API Key Name",
    permissions: [
      "read:posts",
    ],
  },
};
```

## Fields

| Field                                                                                                                       | Type                                                                                                                        | Required                                                                                                                    | Description                                                                                                                 | Example                                                                                                                     |
| --------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `apiKeyId`                                                                                                                  | *string*                                                                                                                    | :heavy_check_mark:                                                                                                          | UUID of the API key to update                                                                                               |                                                                                                                             |
| `updateApiKeyRequest`                                                                                                       | [models.UpdateApiKeyRequest](../../models/updateapikeyrequest.md)                                                           | :heavy_check_mark:                                                                                                          | Updated API key data                                                                                                        | {<br/>"expiresAt": "2024-06-01T00:00:00Z",<br/>"isActive": false,<br/>"name": "Updated API Key Name",<br/>"permissions": [<br/>"read:posts"<br/>]<br/>} |