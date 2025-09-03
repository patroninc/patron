# Auth
(*auth*)

## Overview

Authentication and authorization endpoints

### Available Operations

* [forgotPassword](#forgotpassword) - Forgot password
* [googleAuthRedirect](#googleauthredirect) - Google `OAuth` redirect
* [googleAuthCallback](#googleauthcallback) - Google `OAuth` callback
* [login](#login) - User login
* [logout](#logout) - Logout
* [getMe](#getme) - Get current user info
* [register](#register) - User registration
* [resetPassword](#resetpassword) - Reset password
* [verifyEmail](#verifyemail) - Email verification

## forgotPassword

# Errors
Returns an error if database operations fail or email service fails.

### Example Usage

<!-- UsageSnippet language="typescript" operationID="forgot_password" method="post" path="/api/auth/forgot-password" -->
```typescript
import { Patronts } from "patronts";

const patronts = new Patronts({
  cookieAuth: process.env["PATRONTS_COOKIE_AUTH"] ?? "",
});

async function run() {
  const result = await patronts.auth.forgotPassword({
    email: "user@example.com",
  });

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { PatrontsCore } from "patronts/core.js";
import { authForgotPassword } from "patronts/funcs/authForgotPassword.js";

// Use `PatrontsCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const patronts = new PatrontsCore({
  cookieAuth: process.env["PATRONTS_COOKIE_AUTH"] ?? "",
});

async function run() {
  const res = await authForgotPassword(patronts, {
    email: "user@example.com",
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("authForgotPassword failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`                                                                                                                                                                      | [models.ForgotPasswordRequest](../../models/forgotpasswordrequest.md)                                                                                                          | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[models.ForgotPasswordResponse](../../models/forgotpasswordresponse.md)\>**

### Errors

| Error Type                  | Status Code                 | Content Type                |
| --------------------------- | --------------------------- | --------------------------- |
| errors.ErrorResponse        | 500                         | application/json            |
| errors.PatrontsDefaultError | 4XX, 5XX                    | \*/\*                       |

## googleAuthRedirect

# Errors
Returns an error if session operations fail or `OAuth` service configuration is invalid.

### Example Usage

<!-- UsageSnippet language="typescript" operationID="google_auth_redirect" method="get" path="/api/auth/google" -->
```typescript
import { Patronts } from "patronts";

const patronts = new Patronts({
  cookieAuth: process.env["PATRONTS_COOKIE_AUTH"] ?? "",
});

async function run() {
  await patronts.auth.googleAuthRedirect();


}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { PatrontsCore } from "patronts/core.js";
import { authGoogleAuthRedirect } from "patronts/funcs/authGoogleAuthRedirect.js";

// Use `PatrontsCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const patronts = new PatrontsCore({
  cookieAuth: process.env["PATRONTS_COOKIE_AUTH"] ?? "",
});

async function run() {
  const res = await authGoogleAuthRedirect(patronts);
  if (res.ok) {
    const { value: result } = res;
    
  } else {
    console.log("authGoogleAuthRedirect failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<void\>**

### Errors

| Error Type                  | Status Code                 | Content Type                |
| --------------------------- | --------------------------- | --------------------------- |
| errors.ErrorResponse        | 500                         | application/json            |
| errors.PatrontsDefaultError | 4XX, 5XX                    | \*/\*                       |

## googleAuthCallback

# Errors
Returns an error if `OAuth` state verification fails, token exchange fails, or database operations fail.

### Example Usage

<!-- UsageSnippet language="typescript" operationID="google_auth_callback" method="get" path="/api/auth/google/callback" -->
```typescript
import { Patronts } from "patronts";

const patronts = new Patronts({
  cookieAuth: process.env["PATRONTS_COOKIE_AUTH"] ?? "",
});

async function run() {
  await patronts.auth.googleAuthCallback({
    code: "<value>",
    state: "Alaska",
  });


}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { PatrontsCore } from "patronts/core.js";
import { authGoogleAuthCallback } from "patronts/funcs/authGoogleAuthCallback.js";

// Use `PatrontsCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const patronts = new PatrontsCore({
  cookieAuth: process.env["PATRONTS_COOKIE_AUTH"] ?? "",
});

async function run() {
  const res = await authGoogleAuthCallback(patronts, {
    code: "<value>",
    state: "Alaska",
  });
  if (res.ok) {
    const { value: result } = res;
    
  } else {
    console.log("authGoogleAuthCallback failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`                                                                                                                                                                      | [operations.GoogleAuthCallbackRequest](../../models/operations/googleauthcallbackrequest.md)                                                                                   | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<void\>**

### Errors

| Error Type                  | Status Code                 | Content Type                |
| --------------------------- | --------------------------- | --------------------------- |
| errors.ErrorResponse        | 400                         | application/json            |
| errors.ErrorResponse        | 500                         | application/json            |
| errors.PatrontsDefaultError | 4XX, 5XX                    | \*/\*                       |

## login

# Errors
Returns an error if credentials are invalid, email is not verified, or database operations fail.

### Example Usage

<!-- UsageSnippet language="typescript" operationID="login" method="post" path="/api/auth/login" -->
```typescript
import { Patronts } from "patronts";

const patronts = new Patronts({
  cookieAuth: process.env["PATRONTS_COOKIE_AUTH"] ?? "",
});

async function run() {
  const result = await patronts.auth.login({
    email: "user@example.com",
    password: "password123",
  });

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { PatrontsCore } from "patronts/core.js";
import { authLogin } from "patronts/funcs/authLogin.js";

// Use `PatrontsCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const patronts = new PatrontsCore({
  cookieAuth: process.env["PATRONTS_COOKIE_AUTH"] ?? "",
});

async function run() {
  const res = await authLogin(patronts, {
    email: "user@example.com",
    password: "password123",
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("authLogin failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`                                                                                                                                                                      | [models.LoginRequest](../../models/loginrequest.md)                                                                                                                            | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[models.LoginResponse](../../models/loginresponse.md)\>**

### Errors

| Error Type                  | Status Code                 | Content Type                |
| --------------------------- | --------------------------- | --------------------------- |
| errors.ErrorResponse        | 400                         | application/json            |
| errors.ErrorResponse        | 500                         | application/json            |
| errors.PatrontsDefaultError | 4XX, 5XX                    | \*/\*                       |

## logout

# Errors
Returns an error if session operations fail.

### Example Usage

<!-- UsageSnippet language="typescript" operationID="logout" method="get" path="/api/auth/logout" -->
```typescript
import { Patronts } from "patronts";

const patronts = new Patronts({
  cookieAuth: process.env["PATRONTS_COOKIE_AUTH"] ?? "",
});

async function run() {
  const result = await patronts.auth.logout();

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { PatrontsCore } from "patronts/core.js";
import { authLogout } from "patronts/funcs/authLogout.js";

// Use `PatrontsCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const patronts = new PatrontsCore({
  cookieAuth: process.env["PATRONTS_COOKIE_AUTH"] ?? "",
});

async function run() {
  const res = await authLogout(patronts);
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("authLogout failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[models.LogoutResponse](../../models/logoutresponse.md)\>**

### Errors

| Error Type                  | Status Code                 | Content Type                |
| --------------------------- | --------------------------- | --------------------------- |
| errors.PatrontsDefaultError | 4XX, 5XX                    | \*/\*                       |

## getMe

# Errors
Returns an error if user is not authenticated or serialization fails.

### Example Usage

<!-- UsageSnippet language="typescript" operationID="get_me" method="get" path="/api/auth/me" -->
```typescript
import { Patronts } from "patronts";

const patronts = new Patronts({
  cookieAuth: process.env["PATRONTS_COOKIE_AUTH"] ?? "",
});

async function run() {
  const result = await patronts.auth.getMe();

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { PatrontsCore } from "patronts/core.js";
import { authGetMe } from "patronts/funcs/authGetMe.js";

// Use `PatrontsCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const patronts = new PatrontsCore({
  cookieAuth: process.env["PATRONTS_COOKIE_AUTH"] ?? "",
});

async function run() {
  const res = await authGetMe(patronts);
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("authGetMe failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[models.UserInfoResponse](../../models/userinforesponse.md)\>**

### Errors

| Error Type                  | Status Code                 | Content Type                |
| --------------------------- | --------------------------- | --------------------------- |
| errors.ErrorResponse        | 401                         | application/json            |
| errors.PatrontsDefaultError | 4XX, 5XX                    | \*/\*                       |

## register

# Errors
Returns an error if input validation fails, user already exists, or database operations fail.

### Example Usage

<!-- UsageSnippet language="typescript" operationID="register" method="post" path="/api/auth/register" -->
```typescript
import { Patronts } from "patronts";

const patronts = new Patronts({
  cookieAuth: process.env["PATRONTS_COOKIE_AUTH"] ?? "",
});

async function run() {
  const result = await patronts.auth.register({
    email: "user@example.com",
    password: "password123",
  });

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { PatrontsCore } from "patronts/core.js";
import { authRegister } from "patronts/funcs/authRegister.js";

// Use `PatrontsCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const patronts = new PatrontsCore({
  cookieAuth: process.env["PATRONTS_COOKIE_AUTH"] ?? "",
});

async function run() {
  const res = await authRegister(patronts, {
    email: "user@example.com",
    password: "password123",
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("authRegister failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`                                                                                                                                                                      | [models.RegisterRequest](../../models/registerrequest.md)                                                                                                                      | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[models.RegisterResponse](../../models/registerresponse.md)\>**

### Errors

| Error Type                  | Status Code                 | Content Type                |
| --------------------------- | --------------------------- | --------------------------- |
| errors.ErrorResponse        | 400                         | application/json            |
| errors.ErrorResponse        | 500                         | application/json            |
| errors.PatrontsDefaultError | 4XX, 5XX                    | \*/\*                       |

## resetPassword

# Errors
Returns an error if token is invalid, password validation fails, or database operations fail.

### Example Usage

<!-- UsageSnippet language="typescript" operationID="reset_password" method="post" path="/api/auth/reset-password" -->
```typescript
import { Patronts } from "patronts";

const patronts = new Patronts({
  cookieAuth: process.env["PATRONTS_COOKIE_AUTH"] ?? "",
});

async function run() {
  const result = await patronts.auth.resetPassword({
    newPassword: "newpassword123",
    token: "550e8400-e29b-41d4-a716-446655440000",
  });

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { PatrontsCore } from "patronts/core.js";
import { authResetPassword } from "patronts/funcs/authResetPassword.js";

// Use `PatrontsCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const patronts = new PatrontsCore({
  cookieAuth: process.env["PATRONTS_COOKIE_AUTH"] ?? "",
});

async function run() {
  const res = await authResetPassword(patronts, {
    newPassword: "newpassword123",
    token: "550e8400-e29b-41d4-a716-446655440000",
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("authResetPassword failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`                                                                                                                                                                      | [models.ResetPasswordRequest](../../models/resetpasswordrequest.md)                                                                                                            | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[models.ResetPasswordResponse](../../models/resetpasswordresponse.md)\>**

### Errors

| Error Type                  | Status Code                 | Content Type                |
| --------------------------- | --------------------------- | --------------------------- |
| errors.ErrorResponse        | 400                         | application/json            |
| errors.ErrorResponse        | 500                         | application/json            |
| errors.PatrontsDefaultError | 4XX, 5XX                    | \*/\*                       |

## verifyEmail

# Errors
Returns an error if token is invalid, expired, or database operations fail.

### Example Usage

<!-- UsageSnippet language="typescript" operationID="verify_email" method="get" path="/api/auth/verify-email" -->
```typescript
import { Patronts } from "patronts";

const patronts = new Patronts({
  cookieAuth: process.env["PATRONTS_COOKIE_AUTH"] ?? "",
});

async function run() {
  await patronts.auth.verifyEmail({
    token: "<value>",
  });


}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { PatrontsCore } from "patronts/core.js";
import { authVerifyEmail } from "patronts/funcs/authVerifyEmail.js";

// Use `PatrontsCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const patronts = new PatrontsCore({
  cookieAuth: process.env["PATRONTS_COOKIE_AUTH"] ?? "",
});

async function run() {
  const res = await authVerifyEmail(patronts, {
    token: "<value>",
  });
  if (res.ok) {
    const { value: result } = res;
    
  } else {
    console.log("authVerifyEmail failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`                                                                                                                                                                      | [operations.VerifyEmailRequest](../../models/operations/verifyemailrequest.md)                                                                                                 | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<void\>**

### Errors

| Error Type                  | Status Code                 | Content Type                |
| --------------------------- | --------------------------- | --------------------------- |
| errors.ErrorResponse        | 400                         | application/json            |
| errors.ErrorResponse        | 500                         | application/json            |
| errors.PatrontsDefaultError | 4XX, 5XX                    | \*/\*                       |