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

| Field                                  | Type                                   | Required                               | Description                            |
| -------------------------------------- | -------------------------------------- | -------------------------------------- | -------------------------------------- |
| `email`                                | *string*                               | :heavy_check_mark:                     | User's email address                   |
| `password`                             | *string*                               | :heavy_check_mark:                     | User's password (minimum 8 characters) |