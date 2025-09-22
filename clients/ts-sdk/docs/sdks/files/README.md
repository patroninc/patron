# Files
(*files*)

## Overview

File upload, download, and management endpoints

### Available Operations

* [serveFileCdn](#servefilecdn) - Serve file content with user authentication
* [listFiles](#listfiles) - List user's files with cursor-based pagination
* [uploadFile](#uploadfile) - Upload a file
* [getFile](#getfile) - Get a specific file by ID
* [updateFile](#updatefile) - Update file metadata and properties
* [deleteFile](#deletefile) - Permanently delete a user file

## serveFileCdn

This endpoint is designed to be used to get file content with proper authentication.
It verifies user access to the file and returns the file content with proper cache headers.
The file content is streamed directly from S3 to minimize memory usage for large files.

# Errors
Returns an error if file not found, access denied, or S3 operations fail.

### Example Usage

<!-- UsageSnippet language="typescript" operationID="serve_file_cdn" method="get" path="/api/cdn/files/{file_id}" -->
```typescript
import { Patronts } from "patronts";

const patronts = new Patronts({
  cookieAuth: process.env["PATRONTS_COOKIE_AUTH"] ?? "",
});

async function run() {
  await patronts.files.serveFileCdn({
    fileId: "39974a06-0f39-432d-896c-ec8ec5a187f3",
  });


}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { PatrontsCore } from "patronts/core.js";
import { filesServeFileCdn } from "patronts/funcs/filesServeFileCdn.js";

// Use `PatrontsCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const patronts = new PatrontsCore({
  cookieAuth: process.env["PATRONTS_COOKIE_AUTH"] ?? "",
});

async function run() {
  const res = await filesServeFileCdn(patronts, {
    fileId: "39974a06-0f39-432d-896c-ec8ec5a187f3",
  });
  if (res.ok) {
    const { value: result } = res;
    
  } else {
    console.log("filesServeFileCdn failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`                                                                                                                                                                      | [operations.ServeFileCdnRequest](../../models/operations/servefilecdnrequest.md)                                                                                               | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<void\>**

### Errors

| Error Type                  | Status Code                 | Content Type                |
| --------------------------- | --------------------------- | --------------------------- |
| errors.ErrorResponse        | 401, 403, 404               | application/json            |
| errors.ErrorResponse        | 500                         | application/json            |
| errors.PatrontsDefaultError | 4XX, 5XX                    | \*/\*                       |

## listFiles

# Errors
Returns an error if database operations fail.

### Example Usage

<!-- UsageSnippet language="typescript" operationID="list_files" method="get" path="/api/files" -->
```typescript
import { Patronts } from "patronts";

const patronts = new Patronts({
  cookieAuth: process.env["PATRONTS_COOKIE_AUTH"] ?? "",
});

async function run() {
  const result = await patronts.files.listFiles();

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { PatrontsCore } from "patronts/core.js";
import { filesListFiles } from "patronts/funcs/filesListFiles.js";

// Use `PatrontsCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const patronts = new PatrontsCore({
  cookieAuth: process.env["PATRONTS_COOKIE_AUTH"] ?? "",
});

async function run() {
  const res = await filesListFiles(patronts);
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("filesListFiles failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`                                                                                                                                                                      | [operations.ListFilesRequest](../../models/operations/listfilesrequest.md)                                                                                                     | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[models.UserFileInfo[]](../../models/.md)\>**

### Errors

| Error Type                  | Status Code                 | Content Type                |
| --------------------------- | --------------------------- | --------------------------- |
| errors.ErrorResponse        | 401                         | application/json            |
| errors.ErrorResponse        | 500                         | application/json            |
| errors.PatrontsDefaultError | 4XX, 5XX                    | \*/\*                       |

## uploadFile

# Errors
Returns an error if file upload, database operations, or file system operations fail.

### Example Usage

<!-- UsageSnippet language="typescript" operationID="upload_file" method="post" path="/api/files/actions/upload" -->
```typescript
import { openAsBlob } from "node:fs";
import { Patronts } from "patronts";

const patronts = new Patronts({
  cookieAuth: process.env["PATRONTS_COOKIE_AUTH"] ?? "",
});

async function run() {
  const result = await patronts.files.uploadFile({
    file: await openAsBlob("example.file"),
  });

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { openAsBlob } from "node:fs";
import { PatrontsCore } from "patronts/core.js";
import { filesUploadFile } from "patronts/funcs/filesUploadFile.js";

// Use `PatrontsCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const patronts = new PatrontsCore({
  cookieAuth: process.env["PATRONTS_COOKIE_AUTH"] ?? "",
});

async function run() {
  const res = await filesUploadFile(patronts, {
    file: await openAsBlob("example.file"),
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("filesUploadFile failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`                                                                                                                                                                      | [models.FileUploadRequest](../../models/fileuploadrequest.md)                                                                                                                  | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[models.FileUploadResponse](../../models/fileuploadresponse.md)\>**

### Errors

| Error Type                  | Status Code                 | Content Type                |
| --------------------------- | --------------------------- | --------------------------- |
| errors.ErrorResponse        | 400, 401, 413               | application/json            |
| errors.ErrorResponse        | 500                         | application/json            |
| errors.PatrontsDefaultError | 4XX, 5XX                    | \*/\*                       |

## getFile

# Errors
Returns an error if database operations fail or file not found.

### Example Usage

<!-- UsageSnippet language="typescript" operationID="get_file" method="get" path="/api/files/{file_id}" -->
```typescript
import { Patronts } from "patronts";

const patronts = new Patronts({
  cookieAuth: process.env["PATRONTS_COOKIE_AUTH"] ?? "",
});

async function run() {
  const result = await patronts.files.getFile({
    fileId: "b9989da6-aed4-4643-949a-a7c28d664def",
  });

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { PatrontsCore } from "patronts/core.js";
import { filesGetFile } from "patronts/funcs/filesGetFile.js";

// Use `PatrontsCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const patronts = new PatrontsCore({
  cookieAuth: process.env["PATRONTS_COOKIE_AUTH"] ?? "",
});

async function run() {
  const res = await filesGetFile(patronts, {
    fileId: "b9989da6-aed4-4643-949a-a7c28d664def",
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("filesGetFile failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`                                                                                                                                                                      | [operations.GetFileRequest](../../models/operations/getfilerequest.md)                                                                                                         | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[models.UserFileInfo](../../models/userfileinfo.md)\>**

### Errors

| Error Type                  | Status Code                 | Content Type                |
| --------------------------- | --------------------------- | --------------------------- |
| errors.ErrorResponse        | 401, 403, 404               | application/json            |
| errors.ErrorResponse        | 500                         | application/json            |
| errors.PatrontsDefaultError | 4XX, 5XX                    | \*/\*                       |

## updateFile

# Errors
Returns an error if validation fails, file not found, or database operations fail.

### Example Usage

<!-- UsageSnippet language="typescript" operationID="update_file" method="put" path="/api/files/{file_id}" -->
```typescript
import { Patronts } from "patronts";

const patronts = new Patronts({
  cookieAuth: process.env["PATRONTS_COOKIE_AUTH"] ?? "",
});

async function run() {
  const result = await patronts.files.updateFile({
    fileId: "ce621f1a-00d2-437b-b1d0-5650eed83f65",
    updateUserFileRequest: {
      filename: "renamed_document.pdf",
      metadata: {},
      status: "processed",
    },
  });

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { PatrontsCore } from "patronts/core.js";
import { filesUpdateFile } from "patronts/funcs/filesUpdateFile.js";

// Use `PatrontsCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const patronts = new PatrontsCore({
  cookieAuth: process.env["PATRONTS_COOKIE_AUTH"] ?? "",
});

async function run() {
  const res = await filesUpdateFile(patronts, {
    fileId: "ce621f1a-00d2-437b-b1d0-5650eed83f65",
    updateUserFileRequest: {
      filename: "renamed_document.pdf",
      metadata: {},
      status: "processed",
    },
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("filesUpdateFile failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`                                                                                                                                                                      | [operations.UpdateFileRequest](../../models/operations/updatefilerequest.md)                                                                                                   | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[models.UserFileInfo](../../models/userfileinfo.md)\>**

### Errors

| Error Type                  | Status Code                 | Content Type                |
| --------------------------- | --------------------------- | --------------------------- |
| errors.ErrorResponse        | 401, 403, 404               | application/json            |
| errors.ErrorResponse        | 500                         | application/json            |
| errors.PatrontsDefaultError | 4XX, 5XX                    | \*/\*                       |

## deleteFile

# Errors
Returns an error if file not found, permission denied, or storage operations fail.

### Example Usage

<!-- UsageSnippet language="typescript" operationID="delete_file" method="delete" path="/api/files/{file_id}" -->
```typescript
import { Patronts } from "patronts";

const patronts = new Patronts({
  cookieAuth: process.env["PATRONTS_COOKIE_AUTH"] ?? "",
});

async function run() {
  await patronts.files.deleteFile({
    fileId: "9d527cd7-448b-40b4-9b53-301ef075d563",
  });


}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { PatrontsCore } from "patronts/core.js";
import { filesDeleteFile } from "patronts/funcs/filesDeleteFile.js";

// Use `PatrontsCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const patronts = new PatrontsCore({
  cookieAuth: process.env["PATRONTS_COOKIE_AUTH"] ?? "",
});

async function run() {
  const res = await filesDeleteFile(patronts, {
    fileId: "9d527cd7-448b-40b4-9b53-301ef075d563",
  });
  if (res.ok) {
    const { value: result } = res;
    
  } else {
    console.log("filesDeleteFile failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`                                                                                                                                                                      | [operations.DeleteFileRequest](../../models/operations/deletefilerequest.md)                                                                                                   | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<void\>**

### Errors

| Error Type                  | Status Code                 | Content Type                |
| --------------------------- | --------------------------- | --------------------------- |
| errors.ErrorResponse        | 401, 403, 404               | application/json            |
| errors.ErrorResponse        | 500                         | application/json            |
| errors.PatrontsDefaultError | 4XX, 5XX                    | \*/\*                       |