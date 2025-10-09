# patronts

Developer-friendly & type-safe Typescript SDK specifically catered to leverage *patronts* API.

<div align="left">
    <a href="https://www.speakeasy.com/?utm_source=patronts&utm_campaign=typescript"><img src="https://www.speakeasy.com/assets/badges/built-by-speakeasy.svg" /></a>
    <a href="https://opensource.org/licenses/MIT">
        <img src="https://img.shields.io/badge/License-MIT-blue.svg" style="width: 100px; height: 28px;" />
    </a>
</div>

<!-- Start Summary [summary] -->
## Summary

Patron API: An open source Patreon alternative with lower fees designed for creators who publish ongoing sequential content like books, podcasts, and comics.
<!-- End Summary [summary] -->

<!-- Start Table of Contents [toc] -->
## Table of Contents
<!-- $toc-max-depth=2 -->
* [patronts](#patronts)
  * [SDK Installation](#sdk-installation)
  * [Requirements](#requirements)
  * [SDK Example Usage](#sdk-example-usage)
  * [Authentication](#authentication)
  * [Available Resources and Operations](#available-resources-and-operations)
  * [Standalone functions](#standalone-functions)
  * [File uploads](#file-uploads)
  * [Retries](#retries)
  * [Error Handling](#error-handling)
  * [Server Selection](#server-selection)
  * [Custom HTTP Client](#custom-http-client)
  * [Debugging](#debugging)
* [Development](#development)
  * [Maturity](#maturity)
  * [Contributions](#contributions)

<!-- End Table of Contents [toc] -->

<!-- Start SDK Installation [installation] -->
## SDK Installation

The SDK can be installed with either [npm](https://www.npmjs.com/), [pnpm](https://pnpm.io/), [bun](https://bun.sh/) or [yarn](https://classic.yarnpkg.com/en/) package managers.

### NPM

```bash
npm add patronts
```

### PNPM

```bash
pnpm add patronts
```

### Bun

```bash
bun add patronts
```

### Yarn

```bash
yarn add patronts
```

> [!NOTE]
> This package is published with CommonJS and ES Modules (ESM) support.
<!-- End SDK Installation [installation] -->

<!-- Start Requirements [requirements] -->
## Requirements

For supported JavaScript runtimes, please consult [RUNTIMES.md](RUNTIMES.md).
<!-- End Requirements [requirements] -->

<!-- Start SDK Example Usage [usage] -->
## SDK Example Usage

### Example

```typescript
import { Patronts } from "patronts";

const patronts = new Patronts({
  security: {
    bearerAuth: process.env["PATRONTS_BEARER_AUTH"] ?? "",
    cookieAuth: process.env["PATRONTS_COOKIE_AUTH"] ?? "",
  },
});

async function run() {
  const result = await patronts.apiKeys.list();

  console.log(result);
}

run();

```
<!-- End SDK Example Usage [usage] -->

<!-- Start Authentication [security] -->
## Authentication

### Per-Client Security Schemes

This SDK supports the following security schemes globally:

| Name         | Type   | Scheme      | Environment Variable   |
| ------------ | ------ | ----------- | ---------------------- |
| `bearerAuth` | http   | HTTP Bearer | `PATRONTS_BEARER_AUTH` |
| `cookieAuth` | apiKey | API key     | `PATRONTS_COOKIE_AUTH` |

You can set the security parameters through the `security` optional parameter when initializing the SDK client instance. The selected scheme will be used by default to authenticate with the API for all operations that support it. For example:
```typescript
import { Patronts } from "patronts";

const patronts = new Patronts({
  security: {
    bearerAuth: process.env["PATRONTS_BEARER_AUTH"] ?? "",
    cookieAuth: process.env["PATRONTS_COOKIE_AUTH"] ?? "",
  },
});

async function run() {
  const result = await patronts.apiKeys.list();

  console.log(result);
}

run();

```

### Per-Operation Security Schemes

Some operations in this SDK require the security scheme to be specified at the request level. For example:
```typescript
import { Patronts } from "patronts";

const patronts = new Patronts();

async function run() {
  const result = await patronts.outrank.processWebhook({
    bearerAuth: process.env["PATRONTS_BEARER_AUTH"] ?? "",
  }, {
    data: {
      "recommendations": [
        "Improve meta descriptions",
        "Add alt text to images",
      ],
      "score": 85,
    },
    eventType: "analysis_complete",
  });

  console.log(result);
}

run();

```
<!-- End Authentication [security] -->

<!-- Start Available Resources and Operations [operations] -->
## Available Resources and Operations

<details open>
<summary>Available methods</summary>

### [apiKeys](docs/sdks/apikeys/README.md)

* [list](docs/sdks/apikeys/README.md#list) - List API keys with cursor-based pagination and optional filtering
* [create](docs/sdks/apikeys/README.md#create) - Create a new API key
* [get](docs/sdks/apikeys/README.md#get) - Get a specific API key by ID
* [update](docs/sdks/apikeys/README.md#update) - Update an API key
* [delete](docs/sdks/apikeys/README.md#delete) - Delete an API key (hard delete for security)

### [auth](docs/sdks/auth/README.md)

* [checkEmail](docs/sdks/auth/README.md#checkemail) - Check if email exists
* [forgotPassword](docs/sdks/auth/README.md#forgotpassword) - Forgot password
* [googleRedirect](docs/sdks/auth/README.md#googleredirect) - Google `OAuth` redirect
* [googleCallback](docs/sdks/auth/README.md#googlecallback) - Google `OAuth` callback
* [login](docs/sdks/auth/README.md#login) - User login
* [logout](docs/sdks/auth/README.md#logout) - Logout
* [getCurrentUser](docs/sdks/auth/README.md#getcurrentuser) - Get current user info
* [updateUserInfo](docs/sdks/auth/README.md#updateuserinfo) - Update user information
* [register](docs/sdks/auth/README.md#register) - User registration
* [resendVerificationEmail](docs/sdks/auth/README.md#resendverificationemail) - Resend verification email
* [resetPassword](docs/sdks/auth/README.md#resetpassword) - Reset password
* [verifyEmail](docs/sdks/auth/README.md#verifyemail) - Email verification

### [files](docs/sdks/files/README.md)

* [serveCdn](docs/sdks/files/README.md#servecdn) - Serve file content with user authentication
* [list](docs/sdks/files/README.md#list) - List user's files with cursor-based pagination
* [upload](docs/sdks/files/README.md#upload) - Upload a file
* [get](docs/sdks/files/README.md#get) - Get a specific file by ID
* [update](docs/sdks/files/README.md#update) - Update file metadata and properties
* [delete](docs/sdks/files/README.md#delete) - Permanently delete a user file

### [outrank](docs/sdks/outrank/README.md)

* [processWebhook](docs/sdks/outrank/README.md#processwebhook) - Process Outrank webhook

### [posts](docs/sdks/posts/README.md)

* [list](docs/sdks/posts/README.md#list) - List posts with cursor-based pagination and optional series filtering
* [create](docs/sdks/posts/README.md#create) - Create a new post
* [get](docs/sdks/posts/README.md#get) - Get a specific post by ID with series ownership validation
* [update](docs/sdks/posts/README.md#update) - Update a post
* [delete](docs/sdks/posts/README.md#delete) - Delete a post (soft delete) with series ownership validation

### [series](docs/sdks/series/README.md)

* [list](docs/sdks/series/README.md#list) - List user's series with cursor-based pagination
* [create](docs/sdks/series/README.md#create) - Create a new series
* [get](docs/sdks/series/README.md#get) - Get a specific series by ID with user ownership validation
* [update](docs/sdks/series/README.md#update) - Update a series
* [delete](docs/sdks/series/README.md#delete) - Delete a series (soft delete) with user ownership validation

</details>
<!-- End Available Resources and Operations [operations] -->

<!-- Start Standalone functions [standalone-funcs] -->
## Standalone functions

All the methods listed above are available as standalone functions. These
functions are ideal for use in applications running in the browser, serverless
runtimes or other environments where application bundle size is a primary
concern. When using a bundler to build your application, all unused
functionality will be either excluded from the final bundle or tree-shaken away.

To read more about standalone functions, check [FUNCTIONS.md](./FUNCTIONS.md).

<details>

<summary>Available standalone functions</summary>

- [`apiKeysCreate`](docs/sdks/apikeys/README.md#create) - Create a new API key
- [`apiKeysDelete`](docs/sdks/apikeys/README.md#delete) - Delete an API key (hard delete for security)
- [`apiKeysGet`](docs/sdks/apikeys/README.md#get) - Get a specific API key by ID
- [`apiKeysList`](docs/sdks/apikeys/README.md#list) - List API keys with cursor-based pagination and optional filtering
- [`apiKeysUpdate`](docs/sdks/apikeys/README.md#update) - Update an API key
- [`authCheckEmail`](docs/sdks/auth/README.md#checkemail) - Check if email exists
- [`authForgotPassword`](docs/sdks/auth/README.md#forgotpassword) - Forgot password
- [`authGetCurrentUser`](docs/sdks/auth/README.md#getcurrentuser) - Get current user info
- [`authGoogleCallback`](docs/sdks/auth/README.md#googlecallback) - Google `OAuth` callback
- [`authGoogleRedirect`](docs/sdks/auth/README.md#googleredirect) - Google `OAuth` redirect
- [`authLogin`](docs/sdks/auth/README.md#login) - User login
- [`authLogout`](docs/sdks/auth/README.md#logout) - Logout
- [`authRegister`](docs/sdks/auth/README.md#register) - User registration
- [`authResendVerificationEmail`](docs/sdks/auth/README.md#resendverificationemail) - Resend verification email
- [`authResetPassword`](docs/sdks/auth/README.md#resetpassword) - Reset password
- [`authUpdateUserInfo`](docs/sdks/auth/README.md#updateuserinfo) - Update user information
- [`authVerifyEmail`](docs/sdks/auth/README.md#verifyemail) - Email verification
- [`filesDelete`](docs/sdks/files/README.md#delete) - Permanently delete a user file
- [`filesGet`](docs/sdks/files/README.md#get) - Get a specific file by ID
- [`filesList`](docs/sdks/files/README.md#list) - List user's files with cursor-based pagination
- [`filesServeCdn`](docs/sdks/files/README.md#servecdn) - Serve file content with user authentication
- [`filesUpdate`](docs/sdks/files/README.md#update) - Update file metadata and properties
- [`filesUpload`](docs/sdks/files/README.md#upload) - Upload a file
- [`outrankProcessWebhook`](docs/sdks/outrank/README.md#processwebhook) - Process Outrank webhook
- [`postsCreate`](docs/sdks/posts/README.md#create) - Create a new post
- [`postsDelete`](docs/sdks/posts/README.md#delete) - Delete a post (soft delete) with series ownership validation
- [`postsGet`](docs/sdks/posts/README.md#get) - Get a specific post by ID with series ownership validation
- [`postsList`](docs/sdks/posts/README.md#list) - List posts with cursor-based pagination and optional series filtering
- [`postsUpdate`](docs/sdks/posts/README.md#update) - Update a post
- [`seriesCreate`](docs/sdks/series/README.md#create) - Create a new series
- [`seriesDelete`](docs/sdks/series/README.md#delete) - Delete a series (soft delete) with user ownership validation
- [`seriesGet`](docs/sdks/series/README.md#get) - Get a specific series by ID with user ownership validation
- [`seriesList`](docs/sdks/series/README.md#list) - List user's series with cursor-based pagination
- [`seriesUpdate`](docs/sdks/series/README.md#update) - Update a series

</details>
<!-- End Standalone functions [standalone-funcs] -->

<!-- Start File uploads [file-upload] -->
## File uploads

Certain SDK methods accept files as part of a multi-part request. It is possible and typically recommended to upload files as a stream rather than reading the entire contents into memory. This avoids excessive memory consumption and potentially crashing with out-of-memory errors when working with very large files. The following example demonstrates how to attach a file stream to a request.

> [!TIP]
>
> Depending on your JavaScript runtime, there are convenient utilities that return a handle to a file without reading the entire contents into memory:
>
> - **Node.js v20+:** Since v20, Node.js comes with a native `openAsBlob` function in [`node:fs`](https://nodejs.org/docs/latest-v20.x/api/fs.html#fsopenasblobpath-options).
> - **Bun:** The native [`Bun.file`](https://bun.sh/docs/api/file-io#reading-files-bun-file) function produces a file handle that can be used for streaming file uploads.
> - **Browsers:** All supported browsers return an instance to a [`File`](https://developer.mozilla.org/en-US/docs/Web/API/File) when reading the value from an `<input type="file">` element.
> - **Node.js v18:** A file stream can be created using the `fileFrom` helper from [`fetch-blob/from.js`](https://www.npmjs.com/package/fetch-blob).

```typescript
import { openAsBlob } from "node:fs";
import { Patronts } from "patronts";

const patronts = new Patronts({
  security: {
    bearerAuth: process.env["PATRONTS_BEARER_AUTH"] ?? "",
    cookieAuth: process.env["PATRONTS_COOKIE_AUTH"] ?? "",
  },
});

async function run() {
  const result = await patronts.files.upload({
    file: await openAsBlob("example.file"),
  });

  console.log(result);
}

run();

```
<!-- End File uploads [file-upload] -->

<!-- Start Retries [retries] -->
## Retries

Some of the endpoints in this SDK support retries.  If you use the SDK without any configuration, it will fall back to the default retry strategy provided by the API.  However, the default retry strategy can be overridden on a per-operation basis, or across the entire SDK.

To change the default retry strategy for a single API call, simply provide a retryConfig object to the call:
```typescript
import { Patronts } from "patronts";

const patronts = new Patronts({
  security: {
    bearerAuth: process.env["PATRONTS_BEARER_AUTH"] ?? "",
    cookieAuth: process.env["PATRONTS_COOKIE_AUTH"] ?? "",
  },
});

async function run() {
  const result = await patronts.apiKeys.list({
    retries: {
      strategy: "backoff",
      backoff: {
        initialInterval: 1,
        maxInterval: 50,
        exponent: 1.1,
        maxElapsedTime: 100,
      },
      retryConnectionErrors: false,
    },
  });

  console.log(result);
}

run();

```

If you'd like to override the default retry strategy for all operations that support retries, you can provide a retryConfig at SDK initialization:
```typescript
import { Patronts } from "patronts";

const patronts = new Patronts({
  retryConfig: {
    strategy: "backoff",
    backoff: {
      initialInterval: 1,
      maxInterval: 50,
      exponent: 1.1,
      maxElapsedTime: 100,
    },
    retryConnectionErrors: false,
  },
  security: {
    bearerAuth: process.env["PATRONTS_BEARER_AUTH"] ?? "",
    cookieAuth: process.env["PATRONTS_COOKIE_AUTH"] ?? "",
  },
});

async function run() {
  const result = await patronts.apiKeys.list();

  console.log(result);
}

run();

```
<!-- End Retries [retries] -->

<!-- Start Error Handling [errors] -->
## Error Handling

[`PatrontsError`](./src/models/errors/patrontserror.ts) is the base class for all HTTP error responses. It has the following properties:

| Property            | Type       | Description                                                                             |
| ------------------- | ---------- | --------------------------------------------------------------------------------------- |
| `error.message`     | `string`   | Error message                                                                           |
| `error.statusCode`  | `number`   | HTTP response status code eg `404`                                                      |
| `error.headers`     | `Headers`  | HTTP response headers                                                                   |
| `error.body`        | `string`   | HTTP body. Can be empty string if no body is returned.                                  |
| `error.rawResponse` | `Response` | Raw HTTP response                                                                       |
| `error.data$`       |            | Optional. Some errors may contain structured data. [See Error Classes](#error-classes). |

### Example
```typescript
import { Patronts } from "patronts";
import * as errors from "patronts/models/errors";

const patronts = new Patronts({
  security: {
    bearerAuth: process.env["PATRONTS_BEARER_AUTH"] ?? "",
    cookieAuth: process.env["PATRONTS_COOKIE_AUTH"] ?? "",
  },
});

async function run() {
  try {
    const result = await patronts.apiKeys.list();

    console.log(result);
  } catch (error) {
    // The base class for HTTP error responses
    if (error instanceof errors.PatrontsError) {
      console.log(error.message);
      console.log(error.statusCode);
      console.log(error.body);
      console.log(error.headers);

      // Depending on the method different errors may be thrown
      if (error instanceof errors.ErrorResponse) {
        console.log(error.data$.code); // string
        console.log(error.data$.error); // string
      }
    }
  }
}

run();

```

### Error Classes
**Primary errors:**
* [`PatrontsError`](./src/models/errors/patrontserror.ts): The base class for HTTP error responses.
  * [`ErrorResponse`](./src/models/errors/errorresponse.ts): Standard JSON error response structure for API endpoints. *

<details><summary>Less common errors (6)</summary>

<br />

**Network errors:**
* [`ConnectionError`](./src/models/errors/httpclienterrors.ts): HTTP client was unable to make a request to a server.
* [`RequestTimeoutError`](./src/models/errors/httpclienterrors.ts): HTTP request timed out due to an AbortSignal signal.
* [`RequestAbortedError`](./src/models/errors/httpclienterrors.ts): HTTP request was aborted by the client.
* [`InvalidRequestError`](./src/models/errors/httpclienterrors.ts): Any input used to create a request is invalid.
* [`UnexpectedClientError`](./src/models/errors/httpclienterrors.ts): Unrecognised or unexpected error.


**Inherit from [`PatrontsError`](./src/models/errors/patrontserror.ts)**:
* [`ResponseValidationError`](./src/models/errors/responsevalidationerror.ts): Type mismatch between the data returned from the server and the structure expected by the SDK. See `error.rawValue` for the raw value and `error.pretty()` for a nicely formatted multi-line string.

</details>

\* Check [the method documentation](#available-resources-and-operations) to see if the error is applicable.
<!-- End Error Handling [errors] -->

<!-- Start Server Selection [server] -->
## Server Selection

### Select Server by Index

You can override the default server globally by passing a server index to the `serverIdx: number` optional parameter when initializing the SDK client instance. The selected server will then be used as the default on the operations that use it. This table lists the indexes associated with the available servers:

| #   | Server                   | Description              |
| --- | ------------------------ | ------------------------ |
| 0   | `http://localhost:8080`  | Local development server |
| 1   | `https://api.patron.com` | Production server        |

#### Example

```typescript
import { Patronts } from "patronts";

const patronts = new Patronts({
  serverIdx: 1,
  security: {
    bearerAuth: process.env["PATRONTS_BEARER_AUTH"] ?? "",
    cookieAuth: process.env["PATRONTS_COOKIE_AUTH"] ?? "",
  },
});

async function run() {
  const result = await patronts.apiKeys.list();

  console.log(result);
}

run();

```

### Override Server URL Per-Client

The default server can also be overridden globally by passing a URL to the `serverURL: string` optional parameter when initializing the SDK client instance. For example:
```typescript
import { Patronts } from "patronts";

const patronts = new Patronts({
  serverURL: "https://api.patron.com",
  security: {
    bearerAuth: process.env["PATRONTS_BEARER_AUTH"] ?? "",
    cookieAuth: process.env["PATRONTS_COOKIE_AUTH"] ?? "",
  },
});

async function run() {
  const result = await patronts.apiKeys.list();

  console.log(result);
}

run();

```
<!-- End Server Selection [server] -->

<!-- Start Custom HTTP Client [http-client] -->
## Custom HTTP Client

The TypeScript SDK makes API calls using an `HTTPClient` that wraps the native
[Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API). This
client is a thin wrapper around `fetch` and provides the ability to attach hooks
around the request lifecycle that can be used to modify the request or handle
errors and response.

The `HTTPClient` constructor takes an optional `fetcher` argument that can be
used to integrate a third-party HTTP client or when writing tests to mock out
the HTTP client and feed in fixtures.

The following example shows how to use the `"beforeRequest"` hook to to add a
custom header and a timeout to requests and how to use the `"requestError"` hook
to log errors:

```typescript
import { Patronts } from "patronts";
import { HTTPClient } from "patronts/lib/http";

const httpClient = new HTTPClient({
  // fetcher takes a function that has the same signature as native `fetch`.
  fetcher: (request) => {
    return fetch(request);
  }
});

httpClient.addHook("beforeRequest", (request) => {
  const nextRequest = new Request(request, {
    signal: request.signal || AbortSignal.timeout(5000)
  });

  nextRequest.headers.set("x-custom-header", "custom value");

  return nextRequest;
});

httpClient.addHook("requestError", (error, request) => {
  console.group("Request Error");
  console.log("Reason:", `${error}`);
  console.log("Endpoint:", `${request.method} ${request.url}`);
  console.groupEnd();
});

const sdk = new Patronts({ httpClient: httpClient });
```
<!-- End Custom HTTP Client [http-client] -->

<!-- Start Debugging [debug] -->
## Debugging

You can setup your SDK to emit debug logs for SDK requests and responses.

You can pass a logger that matches `console`'s interface as an SDK option.

> [!WARNING]
> Beware that debug logging will reveal secrets, like API tokens in headers, in log messages printed to a console or files. It's recommended to use this feature only during local development and not in production.

```typescript
import { Patronts } from "patronts";

const sdk = new Patronts({ debugLogger: console });
```

You can also enable a default debug logger by setting an environment variable `PATRONTS_DEBUG` to true.
<!-- End Debugging [debug] -->

<!-- Placeholder for Future Speakeasy SDK Sections -->

# Development

## Maturity

This SDK is in beta, and there may be breaking changes between versions without a major version update. Therefore, we recommend pinning usage
to a specific package version. This way, you can install the same version each time without breaking changes unless you are intentionally
looking for the latest version.

## Contributions

While we value open-source contributions to this SDK, this library is generated programmatically. Any manual changes added to internal files will be overwritten on the next generation. 
We look forward to hearing your feedback. Feel free to open a PR or an issue with a proof of concept and we'll do our best to include it in a future release. 

### SDK Created by [Speakeasy](https://www.speakeasy.com/?utm_source=patronts&utm_campaign=typescript)
