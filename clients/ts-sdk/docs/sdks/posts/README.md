# Posts
(*posts*)

## Overview

Post creation and management endpoints

### Available Operations

* [listPosts](#listposts) - List posts with cursor-based pagination and optional series filtering
* [createPost](#createpost) - Create a new post
* [getPost](#getpost) - Get a specific post by ID with series ownership validation
* [updatePost](#updatepost) - Update a post
* [deletePost](#deletepost) - Delete a post (soft delete) with series ownership validation

## listPosts

# Errors
Returns error if database query fails, series filtering fails, or connection issues occur

### Example Usage

<!-- UsageSnippet language="typescript" operationID="list_posts" method="get" path="/api/posts" -->
```typescript
import { Patronts } from "patronts";

const patronts = new Patronts({
  cookieAuth: process.env["PATRONTS_COOKIE_AUTH"] ?? "",
});

async function run() {
  const result = await patronts.posts.listPosts();

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { PatrontsCore } from "patronts/core.js";
import { postsListPosts } from "patronts/funcs/postsListPosts.js";

// Use `PatrontsCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const patronts = new PatrontsCore({
  cookieAuth: process.env["PATRONTS_COOKIE_AUTH"] ?? "",
});

async function run() {
  const res = await postsListPosts(patronts);
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("postsListPosts failed:", res.error);
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

**Promise\<[models.PostResponse[]](../../models/.md)\>**

### Errors

| Error Type                  | Status Code                 | Content Type                |
| --------------------------- | --------------------------- | --------------------------- |
| errors.ErrorResponse        | 401, 403                    | application/json            |
| errors.ErrorResponse        | 500                         | application/json            |
| errors.PatrontsDefaultError | 4XX, 5XX                    | \*/\*                       |

## createPost

# Errors
Returns error if series not found, access denied, slug/number conflict, or database error

### Example Usage

<!-- UsageSnippet language="typescript" operationID="create_post" method="post" path="/api/posts" -->
```typescript
import { Patronts } from "patronts";

const patronts = new Patronts({
  cookieAuth: process.env["PATRONTS_COOKIE_AUTH"] ?? "",
});

async function run() {
  const result = await patronts.posts.createPost({
    audioFileId: "c3d4e5f6-7890-1234-cdef-123456789012",
    content: "Welcome to our first episode where we discuss the fundamentals...",
    isPremium: false,
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
import { postsCreatePost } from "patronts/funcs/postsCreatePost.js";

// Use `PatrontsCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const patronts = new PatrontsCore({
  cookieAuth: process.env["PATRONTS_COOKIE_AUTH"] ?? "",
});

async function run() {
  const res = await postsCreatePost(patronts, {
    audioFileId: "c3d4e5f6-7890-1234-cdef-123456789012",
    content: "Welcome to our first episode where we discuss the fundamentals...",
    isPremium: false,
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
    console.log("postsCreatePost failed:", res.error);
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

## getPost

# Errors
Returns error if post not found, series access denied, or database connection error

### Example Usage

<!-- UsageSnippet language="typescript" operationID="get_post" method="get" path="/api/posts/{post_id}" -->
```typescript
import { Patronts } from "patronts";

const patronts = new Patronts({
  cookieAuth: process.env["PATRONTS_COOKIE_AUTH"] ?? "",
});

async function run() {
  const result = await patronts.posts.getPost({
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
import { postsGetPost } from "patronts/funcs/postsGetPost.js";

// Use `PatrontsCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const patronts = new PatrontsCore({
  cookieAuth: process.env["PATRONTS_COOKIE_AUTH"] ?? "",
});

async function run() {
  const res = await postsGetPost(patronts, {
    postId: "8b23b066-adfe-4d2d-967f-9f5fad145517",
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("postsGetPost failed:", res.error);
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

## updatePost

# Errors
Returns error if post not found, access denied, slug/number conflict, or database update error

### Example Usage

<!-- UsageSnippet language="typescript" operationID="update_post" method="put" path="/api/posts/{post_id}" -->
```typescript
import { Patronts } from "patronts";

const patronts = new Patronts({
  cookieAuth: process.env["PATRONTS_COOKIE_AUTH"] ?? "",
});

async function run() {
  const result = await patronts.posts.updatePost({
    postId: "05830c7f-2322-4d89-99a3-4f2a63d863b4",
    updatePostRequest: {
      audioFileId: "c3d4e5f6-7890-1234-cdef-123456789012",
      content: "Updated content for the first episode with more details...",
      isPremium: true,
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
import { postsUpdatePost } from "patronts/funcs/postsUpdatePost.js";

// Use `PatrontsCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const patronts = new PatrontsCore({
  cookieAuth: process.env["PATRONTS_COOKIE_AUTH"] ?? "",
});

async function run() {
  const res = await postsUpdatePost(patronts, {
    postId: "05830c7f-2322-4d89-99a3-4f2a63d863b4",
    updatePostRequest: {
      audioFileId: "c3d4e5f6-7890-1234-cdef-123456789012",
      content: "Updated content for the first episode with more details...",
      isPremium: true,
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
    console.log("postsUpdatePost failed:", res.error);
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

## deletePost

# Errors
Returns error if post not found, series access denied, or database deletion error

### Example Usage

<!-- UsageSnippet language="typescript" operationID="delete_post" method="delete" path="/api/posts/{post_id}" -->
```typescript
import { Patronts } from "patronts";

const patronts = new Patronts({
  cookieAuth: process.env["PATRONTS_COOKIE_AUTH"] ?? "",
});

async function run() {
  await patronts.posts.deletePost({
    postId: "8b634f82-0ea7-401a-85d3-c55d13adab6d",
  });


}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { PatrontsCore } from "patronts/core.js";
import { postsDeletePost } from "patronts/funcs/postsDeletePost.js";

// Use `PatrontsCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const patronts = new PatrontsCore({
  cookieAuth: process.env["PATRONTS_COOKIE_AUTH"] ?? "",
});

async function run() {
  const res = await postsDeletePost(patronts, {
    postId: "8b634f82-0ea7-401a-85d3-c55d13adab6d",
  });
  if (res.ok) {
    const { value: result } = res;
    
  } else {
    console.log("postsDeletePost failed:", res.error);
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