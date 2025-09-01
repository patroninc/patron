# RegisterResponse

Response for successful user registration

## Example Usage

```typescript
import { RegisterResponse } from "patronts/models";

let value: RegisterResponse = {
  message: "Registration successful. Please check your email for verification.",
  userId: "d290f1ee-6c54-4b01-90e6-d701748f0851",
};
```

## Fields

| Field                                    | Type                                     | Required                                 | Description                              |
| ---------------------------------------- | ---------------------------------------- | ---------------------------------------- | ---------------------------------------- |
| `message`                                | *string*                                 | :heavy_check_mark:                       | Success message                          |
| `userId`                                 | *string*                                 | :heavy_check_mark:                       | Unique identifier of the registered user |