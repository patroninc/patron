import { describe, it, expect } from "@jest/globals";
import { patronClient } from "../setupTests";

describe("Connection Test", () => {
  it("should have environment variables loaded", () => {
    expect(process.env.PATRON_API_URL).toBeDefined();
    expect(process.env.PATRONTS_BEARER_AUTH).toBeDefined();
    console.log("API URL:", process.env.PATRON_API_URL);
    console.log("Bearer Token:", process.env.PATRONTS_BEARER_AUTH);
  });

  it("should have patron client configured", () => {
    expect(patronClient).toBeDefined();
    console.log("Patron client:", patronClient);
  });

  it("should test basic fetch functionality", async () => {
    const response = await fetch("http://localhost:8080/api/series", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${process.env.PATRONTS_BEARER_AUTH}`,
        "Content-Type": "application/json",
      },
    });

    console.log("Fetch response:", response);
    expect(response).toBeDefined();
    expect(response.status).toBe(200);

    const data = await response.json();
    console.log("Response data:", data);
    expect(Array.isArray(data)).toBe(true);
  });
});