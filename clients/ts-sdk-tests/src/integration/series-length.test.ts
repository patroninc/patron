import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import { patronClient } from "../setupTests";

describe("Series Length API Integration Tests", () => {
  let testSeriesId: string | null = null;
  let testPostIds: string[] = [];
  let testSeriesSlug: string;

  beforeEach(() => {
    // Generate unique slug for each test
    testSeriesSlug = `test-series-length-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    testPostIds = [];
  });

  afterEach(async () => {
    // Clean up created posts and series after each test
    for (const postId of testPostIds) {
      try {
        await patronClient.posts.delete({ postId });
      } catch (error) {
        console.warn("Failed to clean up test post:", error);
      }
    }

    if (testSeriesId) {
      try {
        await patronClient.series.delete({ seriesId: testSeriesId });
      } catch (error) {
        console.warn("Failed to clean up test series:", error);
      }
      testSeriesId = null;
    }
    testPostIds = [];
  });

  describe("Series Length - Initial State", () => {
    it("should have length of 0 or null when series is first created", async () => {
      const createRequest = {
        title: "New Series for Length Test",
        slug: testSeriesSlug,
        description: "Testing initial series length",
      };

      const response = await patronClient.series.create(createRequest);

      expect(response).toBeDefined();
      expect(response?.id).toBeDefined();
      testSeriesId = response?.id || null;

      // Initial length should be 0 or null (no posts yet)
      expect([0, null, undefined]).toContain(response?.length);
    });
  });

  describe("Series Length - Post Creation", () => {
    beforeEach(async () => {
      // Create a test series
      const createRequest = {
        title: "Series for Post Creation Tests",
        slug: testSeriesSlug,
      };
      const response = await patronClient.series.create(createRequest);
      testSeriesId = response?.id || null;
    });

    it("should increment length to 1 after creating first post", async () => {
      const postRequest = {
        seriesId: testSeriesId!,
        title: "First Test Post",
        slug: `test-post-1-${Date.now()}`,
        content: "Test content for first post",
        postNumber: 1,
      };

      const postResponse = await patronClient.posts.create(postRequest);
      expect(postResponse).toBeDefined();
      if (postResponse?.id) {
        testPostIds.push(postResponse.id);
      }
      // Fetch series to check updated length
      const seriesResponse = await patronClient.series.get({
        seriesId: testSeriesId!,
      });

      expect(seriesResponse?.length).toBe(1);
    });

    it("should increment length to 2 after creating second post", async () => {
      // Create first post
      const post1Request = {
        seriesId: testSeriesId!,
        title: "First Post",
        slug: `test-post-1-${Date.now()}`,
        content: "Content 1",
        postNumber: 1,
      };
      const post1Response = await patronClient.posts.create(post1Request);
      if (post1Response?.id) {
        testPostIds.push(post1Response.id!);
      }

      // Create second post
      const post2Request = {
        seriesId: testSeriesId!,
        title: "Second Post",
        slug: `test-post-2-${Date.now()}`,
        content: "Content 2",
        postNumber: 2,
      };
      const post2Response = await patronClient.posts.create(post2Request);
      if (post2Response?.id) {
        testPostIds.push(post2Response.id!);
      }

      // Fetch series to check updated length
      const seriesResponse = await patronClient.series.get({
        seriesId: testSeriesId!,
      });

      expect(seriesResponse?.length).toBe(2);
    });

    it("should increment length correctly with multiple posts", async () => {
      const postCount = 5;

      // Create multiple posts
      for (let i = 0; i < postCount; i++) {
        const postRequest = {
          seriesId: testSeriesId!,
          title: `Test Post ${i + 1}`,
          slug: `test-post-${i + 1}-${Date.now()}-${i}`,
          content: `Content ${i + 1}`,
          postNumber: i + 1,
        };
        const postResponse = await patronClient.posts.create(postRequest);
        testPostIds.push(postResponse.id);
      }

      // Fetch series to check updated length
      const seriesResponse = await patronClient.series.get({
        seriesId: testSeriesId!,
      });

      expect(seriesResponse?.length).toBe(postCount);
    });
  });

  describe("Series Length - Post Deletion", () => {
    beforeEach(async () => {
      // Create a test series with 3 posts
      const createRequest = {
        title: "Series for Deletion Tests",
        slug: testSeriesSlug,
      };
      const seriesResponse = await patronClient.series.create(createRequest);
      testSeriesId = seriesResponse?.id || null;

      // Create 3 posts
      for (let i = 0; i < 3; i++) {
        const postRequest = {
          seriesId: testSeriesId!,
          title: `Test Post ${i + 1}`,
          slug: `test-post-${i + 1}-${Date.now()}-${i}`,
          content: `Content ${i + 1}`,
          postNumber: i + 1,
        };
        const postResponse = await patronClient.posts.create(postRequest);
        testPostIds.push(postResponse.id);
      }
    });

    it("should decrement length after deleting a post", async () => {
      // Verify initial length
      let seriesResponse = await patronClient.series.get({
        seriesId: testSeriesId!,
      });
      expect(seriesResponse.length).toBe(3);

      // Delete one post
      const postIdToDelete = testPostIds[0];
      await patronClient.posts.delete({ postId: postIdToDelete });

      // Fetch series to check updated length
      seriesResponse = await patronClient.series.get({
        seriesId: testSeriesId!,
      });

      expect(seriesResponse?.length).toBe(2);
    });

    it("should decrement to 0 after deleting all posts", async () => {
      // Delete all posts
      for (const postId of testPostIds) {
        await patronClient.posts.delete({ postId });
      }

      // Fetch series to check updated length
      const seriesResponse = await patronClient.series.get({
        seriesId: testSeriesId!,
      });

      expect(seriesResponse?.length).toBe(0);
    });
  });

  describe("Series Length - List Operation", () => {
    beforeEach(async () => {
      // Create a test series with posts
      const createRequest = {
        title: "Series for List Tests",
        slug: testSeriesSlug,
      };
      const seriesResponse = await patronClient.series.create(createRequest);
      testSeriesId = seriesResponse?.id || null;

      // Create 2 posts
      for (let i = 0; i < 2; i++) {
        const postRequest = {
          seriesId: testSeriesId!,
          title: `Test Post ${i + 1}`,
          slug: `test-post-${i + 1}-${Date.now()}-${i}`,
          content: `Content ${i + 1}`,
          postNumber: i + 1,
        };
        const postResponse = await patronClient.posts.create(postRequest);
        testPostIds.push(postResponse.id);
      }
    });

    it("should include length field when listing series", async () => {
      const listResponse = await patronClient.series.list();

      expect(listResponse).toBeDefined();
      expect(Array.isArray(listResponse.result)).toBe(true);

      // Find our test series in the list
      const testSeries = listResponse.result.find((s) => s.id === testSeriesId);

      expect(testSeries).toBeDefined();
      expect(testSeries?.length).toBeDefined();
      expect(testSeries?.length).toBe(2);
    });

    it("should include length field for all series in list", async () => {
      const listResponse = await patronClient.series.list();

      expect(listResponse).toBeDefined();
      expect(Array.isArray(listResponse.result)).toBe(true);

      // Verify that length field exists for all series
      listResponse.result.forEach((series) => {
        expect(series).toHaveProperty("length");
        expect(typeof series.length === "number" || series.length === null).toBe(true);
      });
    });
  });

  describe("Series Length - Update Operation", () => {
    beforeEach(async () => {
      // Create a test series with posts
      const createRequest = {
        title: "Series for Update Tests",
        slug: testSeriesSlug,
      };
      const seriesResponse = await patronClient.series.create(createRequest);
      testSeriesId = seriesResponse?.id || null;

      // Create 2 posts
      for (let i = 0; i < 2; i++) {
        const postRequest = {
          seriesId: testSeriesId!,
          title: `Test Post ${i + 1}`,
          slug: `test-post-${i + 1}-${Date.now()}-${i}`,
          content: `Content ${i + 1}`,
          postNumber: i + 1,
        };
        const postResponse = await patronClient.posts.create(postRequest);
        testPostIds.push(postResponse.id);
      }
    });

    it("should maintain length when updating series metadata", async () => {
      // Verify initial length
      const seriesResponse = await patronClient.series.get({
        seriesId: testSeriesId!,
      });
      expect(seriesResponse?.length).toBe(2);

      // Update series metadata
      const updateRequest = {
        title: "Updated Series Title",
        description: "Updated description",
      };

      const updateResponse = await patronClient.series.update({
        seriesId: testSeriesId!,
        updateSeriesRequest: {
          category: undefined,
          coverImageUrl: undefined,
          slug: undefined,
          ...updateRequest,
        },
      });

      // Length should remain unchanged
      expect(updateResponse?.length).toBe(2);
    });

    it("should include length in update response", async () => {
      const updateRequest = {
        category: "Technology",
      };

      const updateResponse = await patronClient.series.update({
        seriesId: testSeriesId!,
        updateSeriesRequest: {
          coverImageUrl: undefined,
          description: undefined,
          slug: undefined,
          title: undefined,
          ...updateRequest,
        },
      });

      expect(updateResponse).toBeDefined();
      expect(updateResponse).toHaveProperty("length");
      expect(updateResponse?.length).toBe(2);
    });
  });

  describe("Series Length - Edge Cases", () => {
    it("should handle series with no posts correctly", async () => {
      const createRequest = {
        title: "Empty Series",
        slug: testSeriesSlug,
      };

      const response = await patronClient.series.create(createRequest);
      testSeriesId = response?.id || null;

      expect(response?.length === 0 || response?.length === null).toBe(true);
    });

    it("should handle rapid post creation and deletion", async () => {
      // Create series
      const createRequest = {
        title: "Rapid Operations Series",
        slug: testSeriesSlug,
      };
      const seriesResponse = await patronClient.series.create(createRequest);
      testSeriesId = seriesResponse?.id || null;

      // Rapidly create and delete posts
      for (let i = 0; i < 3; i++) {
        const postRequest = {
          seriesId: testSeriesId!,
          title: `Rapid Post ${i}`,
          slug: `rapid-post-${i}-${Date.now()}-${i}`,
          content: "Content",
          postNumber: i + 1,
        };
        const postResponse = await patronClient.posts.create(postRequest);
        const postId = postResponse.id;

        // Immediately delete it
        await patronClient.posts.delete({ postId });
      }

      // Final length should be 0
      const finalResponse = await patronClient.series.get({
        seriesId: testSeriesId!,
      });
      expect(finalResponse?.length).toBe(0);
    });
  });
});
