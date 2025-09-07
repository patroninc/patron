# RegisterRequest

Request body for user registration.

## Example Usage

```typescript
import { RegisterRequest } from "patronts/models";

let value: RegisterRequest = {
  email: "user@example.com",
  password: "password123",
};
```

## Fields

| Field                                   | Type                                    | Required                                | Description                             |
| --------------------------------------- | --------------------------------------- | --------------------------------------- | --------------------------------------- |
| `displayName`                           | *string*                                | :heavy_minus_sign:                      | Optional display name for the user      |
| `email`                                 | *string*                                | :heavy_check_mark:                      | Email address for new user registration |
| `password`                              | *string*                                | :heavy_check_mark:                      | User's password (minimum 8 characters)  |