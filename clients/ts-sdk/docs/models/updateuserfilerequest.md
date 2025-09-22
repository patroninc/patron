# UpdateUserFileRequest

Request payload for updating user file metadata, filename, or status

## Example Usage

```typescript
import { UpdateUserFileRequest } from "patronts/models";

let value: UpdateUserFileRequest = {
  filename: "renamed_document.pdf",
  metadata: {},
  status: "processed",
};
```

## Fields

| Field                                        | Type                                         | Required                                     | Description                                  | Example                                      |
| -------------------------------------------- | -------------------------------------------- | -------------------------------------------- | -------------------------------------------- | -------------------------------------------- |
| `filename`                                   | *string*                                     | :heavy_minus_sign:                           | New filename (optional)                      | renamed_document.pdf                         |
| `metadata`                                   | [models.Value](../models/value.md)           | :heavy_minus_sign:                           | N/A                                          |                                              |
| `status`                                     | [models.FileStatus](../models/filestatus.md) | :heavy_minus_sign:                           | N/A                                          |                                              |