<!-- Start SDK Example Usage [usage] -->
```typescript
import { Patronts } from "patronts";

const patronts = new Patronts({
  cookieAuth: process.env["PATRONTS_COOKIE_AUTH"] ?? "",
});

async function run() {
  await patronts.auth.checkEmail({
    email: "user@example.com",
  });
}

run();

```
<!-- End SDK Example Usage [usage] -->