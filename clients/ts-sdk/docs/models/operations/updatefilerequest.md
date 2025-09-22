# UpdateFileRequest

## Example Usage

```typescript
import { UpdateFileRequest } from "patronts/models/operations";

let value: UpdateFileRequest = {
  fileId: "156e2e09-0fef-462c-8015-6f2cff075dcb",
  updateUserFileRequest: {
    filename: "renamed_document.pdf",
    metadata: {},
    status: "processed",
  },
};
```

## Fields

| Field                                                                                                                 | Type                                                                                                                  | Required                                                                                                              | Description                                                                                                           | Example                                                                                                               |
| --------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `fileId`                                                                                                              | *string*                                                                                                              | :heavy_check_mark:                                                                                                    | UUID of the file to update metadata for                                                                               |                                                                                                                       |
| `updateUserFileRequest`                                                                                               | [models.UpdateUserFileRequest](../../models/updateuserfilerequest.md)                                                 | :heavy_check_mark:                                                                                                    | Updated file metadata, filename, or status                                                                            | {<br/>"filename": "renamed_document.pdf",<br/>"metadata": {<br/>"processed_at": "2023-01-01T12:00:00Z"<br/>},<br/>"status": "processed"<br/>} |