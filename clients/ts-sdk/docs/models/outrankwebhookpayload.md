# OutrankWebhookPayload

Webhook payload from Outrank SEO service

## Example Usage

```typescript
import { OutrankWebhookPayload } from "patronts/models";

let value: OutrankWebhookPayload = {
  data: {
    "recommendations": [
      "Improve meta descriptions",
      "Add alt text to images",
    ],
    "score": 85,
  },
  eventType: "analysis_complete",
};
```

## Fields

| Field                   | Type                    | Required                | Description             | Example                 |
| ----------------------- | ----------------------- | ----------------------- | ----------------------- | ----------------------- |
| `data`                  | Record<string, *any*>   | :heavy_minus_sign:      | N/A                     |                         |
| `eventType`             | *string*                | :heavy_minus_sign:      | Event type from Outrank | analysis_complete       |