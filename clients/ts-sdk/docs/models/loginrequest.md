# LoginRequest

Request body for user login

## Example Usage

```typescript
import { LoginRequest } from "patronts/models";

let value: LoginRequest = {
  email: "user@example.com",
  password: "password123",
};
```

## Fields

| Field                                  | Type                                   | Required                               | Description                            |
| -------------------------------------- | -------------------------------------- | -------------------------------------- | -------------------------------------- |
| `email`                                | *string*                               | :heavy_check_mark:                     | Email address for login authentication |
| `password`                             | *string*                               | :heavy_check_mark:                     | User's password                        |