/*
 * Helper script to create a test user and get authentication credentials
 * This allows you to quickly set up credentials for running tests
 *
 * Usage: npx tsx setup-test-credentials.ts
 */

import { Patronts } from "patronts";
import * as fs from "fs";
import * as path from "path";

const TEST_EMAIL = `test-${Date.now()}@example.com`;
const TEST_PASSWORD = "TestPassword123!";

async function setupCredentials() {
  console.log("Setting up test credentials...\n");

  // Create a client without authentication
  const patronts = new Patronts({
    serverURL: "http://localhost:8080",
  });

  try {
    // Register a new user
    console.log(`Registering test user: ${TEST_EMAIL}`);
    const registerResult = await patronts.auth.register({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      username: `testuser${Date.now()}`,
    });

    if (registerResult.statusCode !== 200 && registerResult.statusCode !== 201) {
      throw new Error(`Registration failed with status ${registerResult.statusCode}`);
    }

    console.log("✓ User registered successfully");

    // Login with the new user
    console.log("Logging in...");
    const loginResult = await patronts.auth.login({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });

    if (loginResult.statusCode !== 200) {
      throw new Error(`Login failed with status ${loginResult.statusCode}`);
    }

    console.log("✓ Login successful");

    // Extract the token or cookie from the response
    // The actual implementation depends on your API's response format
    const token = loginResult.loginResponse?.token;

    if (!token) {
      console.warn("⚠️  No token found in login response");
      console.warn("You may need to manually extract credentials from the browser");
      return;
    }

    // Create or update .env file
    const envPath = path.join(__dirname, ".env");
    let envContent = "";

    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, "utf-8");
    } else {
      envContent = fs.readFileSync(path.join(__dirname, ".env.template"), "utf-8");
    }

    // Update or add the bearer auth token
    if (envContent.includes("PATRONTS_BEARER_AUTH=")) {
      envContent = envContent.replace(
        /PATRONTS_BEARER_AUTH=.*/,
        `PATRONTS_BEARER_AUTH=${token}`
      );
    } else {
      envContent += `\nPATRONTS_BEARER_AUTH=${token}\n`;
    }

    fs.writeFileSync(envPath, envContent);

    console.log("\n✓ Credentials saved to .env file");
    console.log("\nTest user credentials:");
    console.log(`  Email: ${TEST_EMAIL}`);
    console.log(`  Password: ${TEST_PASSWORD}`);
    console.log(`  Token: ${token.substring(0, 20)}...`);
    console.log("\nYou can now run the tests with:");
    console.log("  npx tsx seriesLength.test.ts");
    console.log("  or");
    console.log("  ./run-series-length-test.sh");
  } catch (error) {
    console.error("\n❌ Error setting up credentials:");
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(error);
    }
    console.error("\nPlease make sure:");
    console.error("  1. The backend server is running at http://localhost:8080");
    console.error("  2. The server is accepting new registrations");
    console.error("\nAlternatively, manually set credentials in .env file");
    process.exit(1);
  }
}

setupCredentials();
