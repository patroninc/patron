// Jest setup file for global test configuration
// This file is run before each test file

import dotenv from "dotenv";
import { Patronts, HTTPClient } from "patronts";

// Load environment variables
dotenv.config();

// Create custom HTTP client with forced Authorization header
const httpClient = new HTTPClient();

httpClient.addHook("beforeRequest", (request) => {
  const nextRequest = new Request(request);
  nextRequest.headers.set("Authorization", `Bearer ${process.env.PATRONTS_BEARER_AUTH}`);
  return nextRequest;
});

// Initialize global Patronts client
export const patronClient = new Patronts({
  serverURL: process.env.PATRON_API_URL!,
  httpClient: httpClient,
  security: {
    bearerAuth: process.env.PATRONTS_BEARER_AUTH,
  },
});

// Setup real fetch for integration tests
// Remove fetch mock for integration tests - let Node.js use its built-in fetch

// Global test setup
beforeEach(() => {
  jest.clearAllMocks();
});
