<!-- Start SDK Example Usage [usage] -->
```typescript
import { Patronts } from "patronts";

const patronts = new Patronts();

async function run() {
  const result = await patronts.auth.forgotPassword({
    email: "user@example.com",
  });

  console.log(result);
}

run();

```
<!-- End SDK Example Usage [usage] -->