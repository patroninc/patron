<!-- Start SDK Example Usage [usage] -->
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