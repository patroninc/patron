# UserFileInfo

User file information for API responses

## Example Usage

```typescript
import { UserFileInfo } from "patronts/models";

let value: UserFileInfo = {
  createdAt: new Date("2023-01-01T00:00:00Z"),
  fileHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  fileSize: 1048576,
  filename: "document.pdf",
  id: "d290f1ee-6c54-4b01-90e6-d701748f0851",
  metadata: {},
  mimeType: "application/pdf",
  originalFilename: "My Important Document.pdf",
  status: "uploaded",
  updatedAt: new Date("2023-01-01T00:00:00Z"),
  userId: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
};
```

## Fields

| Field                                                                                         | Type                                                                                          | Required                                                                                      | Description                                                                                   | Example                                                                                       |
| --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `createdAt`                                                                                   | [Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) | :heavy_minus_sign:                                                                            | File upload timestamp                                                                         | 2023-01-01T00:00:00Z                                                                          |
| `fileHash`                                                                                    | *string*                                                                                      | :heavy_check_mark:                                                                            | SHA-256 hash of the file                                                                      | e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855                              |
| `fileSize`                                                                                    | *number*                                                                                      | :heavy_check_mark:                                                                            | Size of the file in bytes                                                                     | 1048576                                                                                       |
| `filename`                                                                                    | *string*                                                                                      | :heavy_check_mark:                                                                            | Current filename                                                                              | document.pdf                                                                                  |
| `id`                                                                                          | *string*                                                                                      | :heavy_check_mark:                                                                            | File's unique identifier                                                                      | d290f1ee-6c54-4b01-90e6-d701748f0851                                                          |
| `metadata`                                                                                    | [models.Value](../models/value.md)                                                            | :heavy_minus_sign:                                                                            | N/A                                                                                           |                                                                                               |
| `mimeType`                                                                                    | *string*                                                                                      | :heavy_check_mark:                                                                            | MIME type of the file                                                                         | application/pdf                                                                               |
| `originalFilename`                                                                            | *string*                                                                                      | :heavy_check_mark:                                                                            | Original filename as uploaded by user                                                         | My Important Document.pdf                                                                     |
| `status`                                                                                      | [models.FileStatus](../models/filestatus.md)                                                  | :heavy_check_mark:                                                                            | File processing status for user uploaded files                                                |                                                                                               |
| `updatedAt`                                                                                   | [Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) | :heavy_minus_sign:                                                                            | File last update timestamp                                                                    | 2023-01-01T00:00:00Z                                                                          |
| `userId`                                                                                      | *string*                                                                                      | :heavy_check_mark:                                                                            | ID of the user who owns this file                                                             | f47ac10b-58cc-4372-a567-0e02b2c3d479                                                          |