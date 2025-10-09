# Posts
(*posts*)

## Overview

Post creation and management endpoints

### Available Operations

* [list](#list) - List posts with cursor-based pagination and optional series filtering
* [create](#create) - Create a new post
* [get](#get) - Get a specific post by ID with series ownership validation
* [update](#update) - Update a post
* [delete](#delete) - Delete a post (soft delete) with series ownership validation

## list

# Errors
Returns error if posts database query fails, series filtering fails, or connection issues occur

### Example Usage

<!-- UsageSnippet language="typescript" operationID="list_posts" method="get" path="/api/posts" -->
```typescript
import { Patronts } from "patronts";

const patronts = new Patronts({
  security: {
    bearerAuth: process.env["PATRONTS_BEARER_AUTH"] ?? "",
    cookieAuth: process.env["PATRONTS_COOKIE_AUTH"] ?? "",
  },
});

async function run() {
  const result = await patronts.posts.list();

  for await (const page of result) {
    console.log(page);
  }
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { PatrontsCore } from "patronts/core.js";
import { postsList } from "patronts/funcs/postsList.js";

// Use `PatrontsCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const patronts = new PatrontsCore({
  security: {
    bearerAuth: process.env["PATRONTS_BEARER_AUTH"] ?? "",
    cookieAuth: process.env["PATRONTS_COOKIE_AUTH"] ?? "",
  },
});

async function run() {
  const res = await postsList(patronts);
  if (res.ok) {
    const { value: result } = res;
    for await (const page of result) {
    console.log(page);
  }
  } else {
    console.log("postsList failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`                                                                                                                                                                      | [operations.ListPostsRequest](../../models/operations/listpostsrequest.md)                                                                                                     | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[operations.ListPostsResponse](../../models/operations/listpostsresponse.md)\>**

### Errors

| Error Type                  | Status Code                 | Content Type                |
| --------------------------- | --------------------------- | --------------------------- |
| errors.ErrorResponse        | 401, 403                    | application/json            |
| errors.ErrorResponse        | 500                         | application/json            |
| errors.PatrontsDefaultError | 4XX, 5XX                    | \*/\*                       |

## create

# Errors
Returns error if series not found, access denied, slug/number conflict, or database error

### Example Usage

<!-- UsageSnippet language="typescript" operationID="create_post" method="post" path="/api/posts" -->
```typescript
import { Patronts } from "patronts";

const patronts = new Patronts({
  security: {
    bearerAuth: process.env["PATRONTS_BEARER_AUTH"] ?? "",
    cookieAuth: process.env["PATRONTS_COOKIE_AUTH"] ?? "",
  },
});

async function run() {
  const result = await patronts.posts.create({
    audioFileId: "c3d4e5f6-7890-1234-cdef-123456789012",
    content: "Welcome to our first episode where we discuss the fundamentals...",
    isPublished: false,
    postNumber: 1,
    seriesId: "b2c3d4e5-6f78-9012-bcde-f12345678901",
    slug: "episode-1-getting-started",
    thumbnailUrl: "https://example.com/thumbnail.jpg",
    title: "Episode 1: Getting Started",
    videoFileId: "d4e5f6a7-8901-2345-def0-234567890123",
  });

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { PatrontsCore } from "patronts/core.js";
import { postsCreate } from "patronts/funcs/postsCreate.js";

// Use `PatrontsCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const patronts = new PatrontsCore({
  security: {
    bearerAuth: process.env["PATRONTS_BEARER_AUTH"] ?? "",
    cookieAuth: process.env["PATRONTS_COOKIE_AUTH"] ?? "",
  },
});

async function run() {
  const res = await postsCreate(patronts, {
    audioFileId: "c3d4e5f6-7890-1234-cdef-123456789012",
    content: "Welcome to our first episode where we discuss the fundamentals...",
    isPublished: false,
    postNumber: 1,
    seriesId: "b2c3d4e5-6f78-9012-bcde-f12345678901",
    slug: "episode-1-getting-started",
    thumbnailUrl: "https://example.com/thumbnail.jpg",
    title: "Episode 1: Getting Started",
    videoFileId: "d4e5f6a7-8901-2345-def0-234567890123",
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("postsCreate failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`                                                                                                                                                                      | [models.CreatePostRequest](../../models/createpostrequest.md)                                                                                                                  | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[models.PostResponse](../../models/postresponse.md)\>**

### Errors

| Error Type                  | Status Code                 | Content Type                |
| --------------------------- | --------------------------- | --------------------------- |
| errors.ErrorResponse        | 400, 401, 403, 409          | application/json            |
| errors.ErrorResponse        | 500                         | application/json            |
| errors.PatrontsDefaultError | 4XX, 5XX                    | \*/\*                       |

## get

# Errors
Returns error if post not found, series access denied, or database connection error

### Example Usage

<!-- UsageSnippet language="typescript" operationID="get_post" method="get" path="/api/posts/{post_id}" -->
```typescript
import { Patronts } from "patronts";

const patronts = new Patronts({
  security: {
    bearerAuth: process.env["PATRONTS_BEARER_AUTH"] ?? "",
    cookieAuth: process.env["PATRONTS_COOKIE_AUTH"] ?? "",
  },
});

async function run() {
  const result = await patronts.posts.get({
    postId: "8b23b066-adfe-4d2d-967f-9f5fad145517",
  });

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { PatrontsCore } from "patronts/core.js";
import { postsGet } from "patronts/funcs/postsGet.js";

// Use `PatrontsCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const patronts = new PatrontsCore({
  security: {
    bearerAuth: process.env["PATRONTS_BEARER_AUTH"] ?? "",
    cookieAuth: process.env["PATRONTS_COOKIE_AUTH"] ?? "",
  },
});

async function run() {
  const res = await postsGet(patronts, {
    postId: "8b23b066-adfe-4d2d-967f-9f5fad145517",
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("postsGet failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`                                                                                                                                                                      | [operations.GetPostRequest](../../models/operations/getpostrequest.md)                                                                                                         | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[models.PostResponse](../../models/postresponse.md)\>**

### Errors

| Error Type                  | Status Code                 | Content Type                |
| --------------------------- | --------------------------- | --------------------------- |
| errors.ErrorResponse        | 401, 403, 404               | application/json            |
| errors.ErrorResponse        | 500                         | application/json            |
| errors.PatrontsDefaultError | 4XX, 5XX                    | \*/\*                       |

## update

# Errors
Returns error if post not found, access denied, slug/number conflict, or database update error

### Example Usage

<!-- UsageSnippet language="typescript" operationID="update_post" method="put" path="/api/posts/{post_id}" -->
```typescript
import { Patronts } from "patronts";

const patronts = new Patronts({
  security: {
    bearerAuth: process.env["PATRONTS_BEARER_AUTH"] ?? "",
    cookieAuth: process.env["PATRONTS_COOKIE_AUTH"] ?? "",
  },
});

async function run() {
  const result = await patronts.posts.update({
    postId: "05830c7f-2322-4d89-99a3-4f2a63d863b4",
    updatePostRequest: {
      audioFileId: "c3d4e5f6-7890-1234-cdef-123456789012",
      content: "Updated content for the first episode with more details...",
      isPublished: true,
      postNumber: 2,
      slug: "episode-1-updated",
      thumbnailUrl: "https://example.com/new-thumbnail.jpg",
      title: "Episode 1: Getting Started (Updated)",
      videoFileId: "d4e5f6a7-8901-2345-def0-234567890123",
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
import { postsUpdate } from "patronts/funcs/postsUpdate.js";

// Use `PatrontsCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const patronts = new PatrontsCore({
  security: {
    bearerAuth: process.env["PATRONTS_BEARER_AUTH"] ?? "",
    cookieAuth: process.env["PATRONTS_COOKIE_AUTH"] ?? "",
  },
});

async function run() {
  const res = await postsUpdate(patronts, {
    postId: "05830c7f-2322-4d89-99a3-4f2a63d863b4",
    updatePostRequest: {
      audioFileId: "c3d4e5f6-7890-1234-cdef-123456789012",
      content: "Updated content for the first episode with more details...",
      isPublished: true,
      postNumber: 2,
      slug: "episode-1-updated",
      thumbnailUrl: "https://example.com/new-thumbnail.jpg",
      title: "Episode 1: Getting Started (Updated)",
      videoFileId: "d4e5f6a7-8901-2345-def0-234567890123",
    },
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("postsUpdate failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`                                                                                                                                                                      | [operations.UpdatePostRequest](../../models/operations/updatepostrequest.md)                                                                                                   | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[models.PostResponse](../../models/postresponse.md)\>**

### Errors

| Error Type                  | Status Code                 | Content Type                |
| --------------------------- | --------------------------- | --------------------------- |
| errors.ErrorResponse        | 401, 403, 404, 409          | application/json            |
| errors.ErrorResponse        | 500                         | application/json            |
| errors.PatrontsDefaultError | 4XX, 5XX                    | \*/\*                       |

## delete

# Errors
Returns error if post not found, series access denied, or database deletion error

### Example Usage

<!-- UsageSnippet language="typescript" operationID="delete_post" method="delete" path="/api/posts/{post_id}" -->
```typescript
import { Patronts } from "patronts";

const patronts = new Patronts({
  security: {
    bearerAuth: process.env["PATRONTS_BEARER_AUTH"] ?? "",
    cookieAuth: process.env["PATRONTS_COOKIE_AUTH"] ?? "",
  },
});

async function run() {
  await patronts.posts.delete({
    postId: "8b634f82-0ea7-401a-85d3-c55d13adab6d",
  });


}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { PatrontsCore } from "patronts/core.js";
import { postsDelete } from "patronts/funcs/postsDelete.js";

// Use `PatrontsCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const patronts = new PatrontsCore({
  security: {
    bearerAuth: process.env["PATRONTS_BEARER_AUTH"] ?? "",
    cookieAuth: process.env["PATRONTS_COOKIE_AUTH"] ?? "",
  },
});

async function run() {
  const res = await postsDelete(patronts, {
    postId: "8b634f82-0ea7-401a-85d3-c55d13adab6d",
  });
  if (res.ok) {
    const { value: result } = res;
    
  } else {
    console.log("postsDelete failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`                                                                                                                                                                      | [operations.DeletePostRequest](../../models/operations/deletepostrequest.md)                                                                                                   | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
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