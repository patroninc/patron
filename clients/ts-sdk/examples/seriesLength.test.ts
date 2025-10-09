/*
 * Integration tests for series length functionality
 *
 * Setup:
 * 1. Make sure the backend server is running locally
 * 2. Create a .env file in the examples directory with:
 *    PATRONTS_BEARER_AUTH=your_bearer_token
 *    PATRONTS_COOKIE_AUTH=your_cookie_value
 * 3. You can get these values by logging into the app and checking your browser's
 *    developer tools (Application > Cookies for cookie, or Network tab for bearer token)
 *
 * To run these tests from the project root:
 * cd clients/ts-sdk/examples && npm run build && npx tsx seriesLength.test.ts
 */

import dotenv from "dotenv";
dotenv.config();

import { Patronts } from "patronts";

// Check if credentials are provided
if (!process.env["PATRONTS_BEARER_AUTH"] && !process.env["PATRONTS_COOKIE_AUTH"]) {
  console.error("❌ Error: No authentication credentials found!");
  console.error("\nPlease create a .env file in the examples directory with:");
  console.error("  PATRONTS_BEARER_AUTH=your_bearer_token");
  console.error("  PATRONTS_COOKIE_AUTH=your_cookie_value");
  console.error("\nYou can copy .env.template to .env and fill in your credentials.");
  process.exit(1);
}

const patronts = new Patronts({
  security: {
    bearerAuth: process.env["PATRONTS_BEARER_AUTH"] ?? "",
    cookieAuth: process.env["PATRONTS_COOKIE_AUTH"] ?? "",
  },
});

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

async function test(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    results.push({ name, passed: true });
    console.log(`✓ ${name}`);
  } catch (error) {
    results.push({
      name,
      passed: false,
      error: error instanceof Error ? error.message : String(error),
    });
    console.error(`✗ ${name}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function main() {
  console.log("Running series length integration tests...\n");

  let testSeriesId: string | undefined;
  let testPostId: string | undefined;

  // Test 1: Create a series and verify initial length
  await test("Create series - initial length should be 0 or null", async () => {
    const seriesResult = await patronts.series.create({
      title: `Test Series ${Date.now()}`,
      slug: `test-series-${Date.now()}`,
      description: "Test series for length functionality",
      category: "Testing",
    });

    assert(
      seriesResult.statusCode === 201,
      `Expected status 201, got ${seriesResult.statusCode}`
    );
    assert(
      seriesResult.seriesResponse !== undefined,
      "Series response should be defined"
    );

    testSeriesId = seriesResult.seriesResponse!.id;

    // Initial length should be 0 or null (no posts yet)
    const length = seriesResult.seriesResponse!.length;
    assert(
      length === 0 || length === null || length === undefined,
      `Expected initial length to be 0, null, or undefined, got ${length}`
    );
  });

  // Test 2: Create a post and verify length increments
  await test("Create post - series length should increment to 1", async () => {
    assert(testSeriesId !== undefined, "Test series ID should be defined");

    const postResult = await patronts.posts.create({
      seriesId: testSeriesId!,
      title: "Test Post 1",
      slug: `test-post-1-${Date.now()}`,
      content: "Test content",
      summary: "Test summary",
    });

    assert(
      postResult.statusCode === 201,
      `Expected status 201, got ${postResult.statusCode}`
    );

    testPostId = postResult.postResponse!.id;

    // Fetch the series to check updated length
    const seriesResult = await patronts.series.get(testSeriesId!);
    assert(
      seriesResult.statusCode === 200,
      `Expected status 200, got ${seriesResult.statusCode}`
    );
    assert(
      seriesResult.seriesResponse?.length === 1,
      `Expected length to be 1, got ${seriesResult.seriesResponse?.length}`
    );
  });

  // Test 3: Create another post and verify length increments to 2
  await test("Create second post - series length should increment to 2", async () => {
    assert(testSeriesId !== undefined, "Test series ID should be defined");

    const postResult = await patronts.posts.create({
      seriesId: testSeriesId!,
      title: "Test Post 2",
      slug: `test-post-2-${Date.now()}`,
      content: "Test content 2",
      summary: "Test summary 2",
    });

    assert(
      postResult.statusCode === 201,
      `Expected status 201, got ${postResult.statusCode}`
    );

    // Fetch the series to check updated length
    const seriesResult = await patronts.series.get(testSeriesId!);
    assert(
      seriesResult.statusCode === 200,
      `Expected status 200, got ${seriesResult.statusCode}`
    );
    assert(
      seriesResult.seriesResponse?.length === 2,
      `Expected length to be 2, got ${seriesResult.seriesResponse?.length}`
    );
  });

  // Test 4: Delete a post and verify length decrements
  await test("Delete post - series length should decrement to 1", async () => {
    assert(testSeriesId !== undefined, "Test series ID should be defined");
    assert(testPostId !== undefined, "Test post ID should be defined");

    const deleteResult = await patronts.posts.delete(testPostId!);
    assert(
      deleteResult.statusCode === 204,
      `Expected status 204, got ${deleteResult.statusCode}`
    );

    // Fetch the series to check updated length
    const seriesResult = await patronts.series.get(testSeriesId!);
    assert(
      seriesResult.statusCode === 200,
      `Expected status 200, got ${seriesResult.statusCode}`
    );
    assert(
      seriesResult.seriesResponse?.length === 1,
      `Expected length to be 1 after deletion, got ${seriesResult.seriesResponse?.length}`
    );
  });

  // Test 5: List series and verify length is included
  await test("List series - length should be included in response", async () => {
    const listResult = await patronts.series.list({});

    assert(
      listResult.statusCode === 200,
      `Expected status 200, got ${listResult.statusCode}`
    );
    assert(
      listResult.seriesListResponse?.series !== undefined,
      "Series list should be defined"
    );

    // Find our test series in the list
    const testSeries = listResult.seriesListResponse!.series.find(
      (s) => s.id === testSeriesId
    );

    if (testSeries) {
      assert(
        testSeries.length === 1,
        `Expected length to be 1 in list, got ${testSeries.length}`
      );
      assert(
        testSeries.length !== undefined && testSeries.length !== null,
        "Length field should be present in list response"
      );
    }
  });

  // Test 6: Update series and verify length is maintained
  await test("Update series - length should remain unchanged", async () => {
    assert(testSeriesId !== undefined, "Test series ID should be defined");

    const updateResult = await patronts.series.update(testSeriesId!, {
      title: "Updated Test Series",
    });

    assert(
      updateResult.statusCode === 200,
      `Expected status 200, got ${updateResult.statusCode}`
    );
    assert(
      updateResult.seriesResponse?.length === 1,
      `Expected length to remain 1 after update, got ${updateResult.seriesResponse?.length}`
    );
  });

  // Cleanup: Delete the test series
  await test("Cleanup - delete test series", async () => {
    assert(testSeriesId !== undefined, "Test series ID should be defined");

    const deleteResult = await patronts.series.delete(testSeriesId!);
    assert(
      deleteResult.statusCode === 204,
      `Expected status 204, got ${deleteResult.statusCode}`
    );
  });

  // Print summary
  console.log("\n" + "=".repeat(50));
  console.log("Test Summary:");
  console.log("=".repeat(50));
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  console.log(`Total: ${results.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);

  if (failed > 0) {
    console.log("\nFailed tests:");
    results
      .filter((r) => !r.passed)
      .forEach((r) => console.log(`  - ${r.name}: ${r.error}`));
    process.exit(1);
  } else {
    console.log("\n✓ All tests passed!");
    process.exit(0);
  }
}

main().catch((error) => {
  console.error("Fatal error running tests:", error);
  process.exit(1);
});
