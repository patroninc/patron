# Series
(*series*)

## Overview

Series creation and management endpoints

### Available Operations

* [listSeries](#listseries) - List user's series with cursor-based pagination
* [createSeries](#createseries) - Create a new series
* [getSeries](#getseries) - Get a specific series by ID with user ownership validation
* [updateSeries](#updateseries) - Update a series
* [deleteSeries](#deleteseries) - Delete a series (soft delete) with user ownership validation

## listSeries

# Errors
Returns error if database query fails or connection issues occur

### Example Usage

<!-- UsageSnippet language="typescript" operationID="list_series" method="get" path="/api/series" -->
```typescript
import { Patronts } from "patronts";

const patronts = new Patronts({
  cookieAuth: process.env["PATRONTS_COOKIE_AUTH"] ?? "",
});

async function run() {
  const result = await patronts.series.listSeries();

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { PatrontsCore } from "patronts/core.js";
import { seriesListSeries } from "patronts/funcs/seriesListSeries.js";

// Use `PatrontsCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const patronts = new PatrontsCore({
  cookieAuth: process.env["PATRONTS_COOKIE_AUTH"] ?? "",
});

async function run() {
  const res = await seriesListSeries(patronts);
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("seriesListSeries failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`                                                                                                                                                                      | [operations.ListSeriesRequest](../../models/operations/listseriesrequest.md)                                                                                                   | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[models.SeriesResponse[]](../../models/.md)\>**

### Errors

| Error Type                  | Status Code                 | Content Type                |
| --------------------------- | --------------------------- | --------------------------- |
| errors.ErrorResponse        | 401                         | application/json            |
| errors.ErrorResponse        | 500                         | application/json            |
| errors.PatrontsDefaultError | 4XX, 5XX                    | \*/\*                       |

## createSeries

# Errors
Returns error if series creation fails, slug conflict, or database error

### Example Usage

<!-- UsageSnippet language="typescript" operationID="create_series" method="post" path="/api/series" -->
```typescript
import { Patronts } from "patronts";

const patronts = new Patronts({
  cookieAuth: process.env["PATRONTS_COOKIE_AUTH"] ?? "",
});

async function run() {
  const result = await patronts.series.createSeries({
    category: "Technology",
    coverImageUrl: "https://example.com/cover.jpg",
    description: "A weekly podcast about technology and innovation",
    isMonetized: false,
    isPublished: false,
    pricingTier: "free",
    slug: "my-awesome-podcast",
    title: "My Awesome Podcast",
  });

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { PatrontsCore } from "patronts/core.js";
import { seriesCreateSeries } from "patronts/funcs/seriesCreateSeries.js";

// Use `PatrontsCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const patronts = new PatrontsCore({
  cookieAuth: process.env["PATRONTS_COOKIE_AUTH"] ?? "",
});

async function run() {
  const res = await seriesCreateSeries(patronts, {
    category: "Technology",
    coverImageUrl: "https://example.com/cover.jpg",
    description: "A weekly podcast about technology and innovation",
    isMonetized: false,
    isPublished: false,
    pricingTier: "free",
    slug: "my-awesome-podcast",
    title: "My Awesome Podcast",
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("seriesCreateSeries failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`                                                                                                                                                                      | [models.CreateSeriesRequest](../../models/createseriesrequest.md)                                                                                                              | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[models.SeriesResponse](../../models/seriesresponse.md)\>**

### Errors

| Error Type                  | Status Code                 | Content Type                |
| --------------------------- | --------------------------- | --------------------------- |
| errors.ErrorResponse        | 400, 401, 409               | application/json            |
| errors.ErrorResponse        | 500                         | application/json            |
| errors.PatrontsDefaultError | 4XX, 5XX                    | \*/\*                       |

## getSeries

# Errors
Returns error if series not found, user access denied, or database connection error

### Example Usage

<!-- UsageSnippet language="typescript" operationID="get_series" method="get" path="/api/series/{series_id}" -->
```typescript
import { Patronts } from "patronts";

const patronts = new Patronts({
  cookieAuth: process.env["PATRONTS_COOKIE_AUTH"] ?? "",
});

async function run() {
  const result = await patronts.series.getSeries({
    seriesId: "8d41996a-2849-497f-a32a-300c043d4e31",
  });

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { PatrontsCore } from "patronts/core.js";
import { seriesGetSeries } from "patronts/funcs/seriesGetSeries.js";

// Use `PatrontsCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const patronts = new PatrontsCore({
  cookieAuth: process.env["PATRONTS_COOKIE_AUTH"] ?? "",
});

async function run() {
  const res = await seriesGetSeries(patronts, {
    seriesId: "8d41996a-2849-497f-a32a-300c043d4e31",
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("seriesGetSeries failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`                                                                                                                                                                      | [operations.GetSeriesRequest](../../models/operations/getseriesrequest.md)                                                                                                     | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[models.SeriesResponse](../../models/seriesresponse.md)\>**

### Errors

| Error Type                  | Status Code                 | Content Type                |
| --------------------------- | --------------------------- | --------------------------- |
| errors.ErrorResponse        | 401, 403, 404               | application/json            |
| errors.ErrorResponse        | 500                         | application/json            |
| errors.PatrontsDefaultError | 4XX, 5XX                    | \*/\*                       |

## updateSeries

# Errors
Returns error if series not found, access denied, slug conflict, or database update error

### Example Usage

<!-- UsageSnippet language="typescript" operationID="update_series" method="put" path="/api/series/{series_id}" -->
```typescript
import { Patronts } from "patronts";

const patronts = new Patronts({
  cookieAuth: process.env["PATRONTS_COOKIE_AUTH"] ?? "",
});

async function run() {
  const result = await patronts.series.updateSeries({
    seriesId: "3a6d3426-0ca8-459f-9b67-866f35bbfc88",
    updateSeriesRequest: {
      category: "Technology",
      coverImageUrl: "https://example.com/new-cover.jpg",
      description: "An updated description with more details",
      isMonetized: true,
      isPublished: true,
      pricingTier: "premium",
      slug: "my-updated-podcast",
      title: "My Updated Podcast",
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
import { seriesUpdateSeries } from "patronts/funcs/seriesUpdateSeries.js";

// Use `PatrontsCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const patronts = new PatrontsCore({
  cookieAuth: process.env["PATRONTS_COOKIE_AUTH"] ?? "",
});

async function run() {
  const res = await seriesUpdateSeries(patronts, {
    seriesId: "3a6d3426-0ca8-459f-9b67-866f35bbfc88",
    updateSeriesRequest: {
      category: "Technology",
      coverImageUrl: "https://example.com/new-cover.jpg",
      description: "An updated description with more details",
      isMonetized: true,
      isPublished: true,
      pricingTier: "premium",
      slug: "my-updated-podcast",
      title: "My Updated Podcast",
    },
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("seriesUpdateSeries failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`                                                                                                                                                                      | [operations.UpdateSeriesRequest](../../models/operations/updateseriesrequest.md)                                                                                               | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[models.SeriesResponse](../../models/seriesresponse.md)\>**

### Errors

| Error Type                  | Status Code                 | Content Type                |
| --------------------------- | --------------------------- | --------------------------- |
| errors.ErrorResponse        | 401, 403, 404, 409          | application/json            |
| errors.ErrorResponse        | 500                         | application/json            |
| errors.PatrontsDefaultError | 4XX, 5XX                    | \*/\*                       |

## deleteSeries

# Errors
Returns error if series not found, user access denied, or database deletion error

### Example Usage

<!-- UsageSnippet language="typescript" operationID="delete_series" method="delete" path="/api/series/{series_id}" -->
```typescript
import { Patronts } from "patronts";

const patronts = new Patronts({
  cookieAuth: process.env["PATRONTS_COOKIE_AUTH"] ?? "",
});

async function run() {
  await patronts.series.deleteSeries({
    seriesId: "39e98c84-7f40-41b5-aa2a-96cccef6c6c9",
  });


}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { PatrontsCore } from "patronts/core.js";
import { seriesDeleteSeries } from "patronts/funcs/seriesDeleteSeries.js";

// Use `PatrontsCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const patronts = new PatrontsCore({
  cookieAuth: process.env["PATRONTS_COOKIE_AUTH"] ?? "",
});

async function run() {
  const res = await seriesDeleteSeries(patronts, {
    seriesId: "39e98c84-7f40-41b5-aa2a-96cccef6c6c9",
  });
  if (res.ok) {
    const { value: result } = res;
    
  } else {
    console.log("seriesDeleteSeries failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`                                                                                                                                                                      | [operations.DeleteSeriesRequest](../../models/operations/deleteseriesrequest.md)                                                                                               | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
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