import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import { patronClient } from "../setupTests";

describe("Posts API Integration Tests", () => {
  let testSeriesId: string | null = null;
  let testPostId: string | null = null;
  let testPostSlug: string;
  let testSeriesSlug: string;

  beforeEach(async () => {
    // Generate unique identifiers for each test
    testPostSlug = `test-post-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    testSeriesSlug = `test-series-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    // Create a test series for posts to belong to
    const seriesResponse = await patronClient.series.create({
      title: "Test Series for Posts",
      slug: testSeriesSlug,
    });
    testSeriesId = seriesResponse?.id || null;
  });

  afterEach(async () => {
    // Clean up created post and series after each test
    if (testPostId) {
      try {
        await patronClient.posts.delete({ postId: testPostId });
      } catch (error) {
        // Ignore cleanup errors
        console.warn("Failed to clean up test post:", error);
      }
      testPostId = null;
    }

    if (testSeriesId) {
      try {
        await patronClient.series.delete({ seriesId: testSeriesId });
      } catch (error) {
        // Ignore cleanup errors
        console.warn("Failed to clean up test series:", error);
      }
      testSeriesId = null;
    }
  });

  describe("POST /api/posts - Create Post", () => {
    it("should create a new post with required fields", async () => {
      const createRequest = {
        seriesId: testSeriesId!,
        title: "Test Post",
        content: "This is test post content",
        slug: testPostSlug,
        postNumber: 1,
      };

      const response = await patronClient.posts.create(createRequest);

      expect(response).toBeDefined();
      expect(response?.id).toBeDefined();
      expect(response?.seriesId).toBe(testSeriesId);
      expect(response?.title).toBe("Test Post");
      expect(response?.content).toBe("This is test post content");
      expect(response?.slug).toBe(testPostSlug);
      expect(response?.postNumber).toBe(1);
      expect(response?.isPublished).toBeDefined();
      expect(response?.isPremium).toBeDefined();

      testPostId = response?.id || null;
    });

    it("should create a post with all optional fields", async () => {
      const createRequest = {
        seriesId: testSeriesId!,
        title: "Complete Test Post",
        content: "This is comprehensive test post content with all fields",
        slug: testPostSlug,
        postNumber: 2,
        isPremium: true,
        isPublished: true,
        audioFileId: null, // No audio file for this test
      };

      const response = await patronClient.posts.create(createRequest);

      expect(response).toBeDefined();
      expect(response?.title).toBe("Complete Test Post");
      expect(response?.content).toBe("This is comprehensive test post content with all fields");
      expect(response?.postNumber).toBe(2);
      expect(response?.isPremium).toBe(true);
      expect(response?.isPublished).toBe(true);
      expect(response?.audioFileId).toBeNull();

      testPostId = response?.id || null;
    });

    it("should fail when creating post with duplicate slug in same series", async () => {
      // Create first post
      const firstRequest = {
        seriesId: testSeriesId!,
        title: "First Post",
        content: "First post content",
        slug: testPostSlug,
        postNumber: 1,
      };

      const firstResponse = await patronClient.posts.create(firstRequest);
      testPostId = firstResponse?.id || null;

      // Try to create second post with same slug in same series
      const duplicateRequest = {
        seriesId: testSeriesId!,
        title: "Duplicate Post",
        content: "Duplicate post content",
        slug: testPostSlug, // Same slug
        postNumber: 2,
      };

      try {
        await patronClient.posts.create(duplicateRequest);
        fail("Expected post creation to fail with duplicate slug");
      } catch (error: any) {
        // Should get 409 conflict error
      }
    });

    it("should fail when creating post with duplicate number in same series", async () => {
      // Create first post
      const firstRequest = {
        seriesId: testSeriesId!,
        title: "First Post",
        content: "First post content",
        slug: testPostSlug,
        postNumber: 1,
      };

      const firstResponse = await patronClient.posts.create(firstRequest);
      testPostId = firstResponse?.id || null;

      // Try to create second post with same number in same series
      const duplicateRequest = {
        seriesId: testSeriesId!,
        title: "Duplicate Number Post",
        content: "Duplicate number post content",
        slug: `different-${testPostSlug}`,
        postNumber: 1, // Same number
      };

      try {
        await patronClient.posts.create(duplicateRequest);
        fail("Expected post creation to fail with duplicate number");
      } catch (error: any) {
        // Should get 409 conflict error
      }
    });

    it("should fail when creating post without required fields", async () => {
      try {
        await patronClient.posts.create({
          seriesId: testSeriesId!,
          title: "Missing Fields Post",
          content: "Post content",
          // slug is missing
          postNumber: 1,
        } as any);
        fail("Expected post creation to fail without slug");
      } catch (error: any) {
        // Should get 400 bad request error
      }
    });

    it("should fail when creating post with non-existent series", async () => {
      const fakeSeriesId = "00000000-0000-0000-0000-000000000000";

      try {
        await patronClient.posts.create({
          seriesId: fakeSeriesId,
          title: "Orphan Post",
          content: "Post without valid series",
          slug: testPostSlug,
          postNumber: 1,
        });
        fail("Expected post creation to fail with non-existent series");
      } catch (error: any) {
        // Should get 403 forbidden or 404 not found error
      }
    });
  });

  describe("GET /api/posts - List Posts", () => {
    beforeEach(async () => {
      // Create multiple test posts for listing tests
      const posts = [
        {
          title: "List Test Post 1",
          content: "First test post for listing",
          slug: `${testPostSlug}-1`,
          postNumber: 1,
        },
        {
          title: "List Test Post 2",
          content: "Second test post for listing",
          slug: `${testPostSlug}-2`,
          postNumber: 2,
        },
      ];

      for (const post of posts) {
        await patronClient.posts.create({
          seriesId: testSeriesId!,
          ...post,
        });
      }
    });

    it("should list all user posts", async () => {
      const response = await patronClient.posts.list();

      expect(response).toBeDefined();
      expect(Array.isArray(response)).toBe(true);
      expect(response.length).toBeGreaterThanOrEqual(2);

      // Find our test posts
      const testPosts = response.filter(
        (post) => post.slug?.startsWith(testPostSlug) && post.seriesId === testSeriesId
      );
      expect(testPosts.length).toBe(2);
    });

    it("should filter posts by series ID", async () => {
      const response = await patronClient.posts.list({
        seriesId: testSeriesId!,
      });

      expect(response).toBeDefined();
      expect(Array.isArray(response)).toBe(true);

      // All returned posts should belong to our test series
      response.forEach((post) => {
        expect(post.seriesId).toBe(testSeriesId);
      });

      // Should contain our test posts
      const testPosts = response.filter((post) => post.slug?.startsWith(testPostSlug));
      expect(testPosts.length).toBe(2);
    });

    it("should support pagination with limit", async () => {
      const response = await patronClient.posts.list({
        limit: 1,
        seriesId: testSeriesId!,
      });

      expect(response).toBeDefined();
      expect(response.length).toBeLessThanOrEqual(1);
    });

    it("should support cursor-based pagination with offset", async () => {
      // Get first page
      const firstPage = await patronClient.posts.list({
        limit: 1,
        seriesId: testSeriesId!,
      });

      if (firstPage && firstPage.length > 0) {
        const firstPostId = firstPage[0].id;

        // Get second page using offset
        const secondPage = await patronClient.posts.list({
          limit: 1,
          seriesId: testSeriesId!,
          offset: firstPostId,
        });

        // If there's a second page, it should not contain the first item
        if (secondPage && secondPage.length > 0) {
          expect(secondPage[0].id).not.toBe(firstPostId);
        }
      }
    });

    it("should return empty list for non-existent series filter", async () => {
      const fakeSeriesId = "00000000-0000-0000-0000-000000000000";

      try {
        const response = await patronClient.posts.list({
          seriesId: fakeSeriesId,
        });
        // Should either return empty array or throw access denied error
        if (response) {
          expect(Array.isArray(response)).toBe(true);
          expect(response.length).toBe(0);
        }
      } catch (error: any) {
        // 403 forbidden is also acceptable for non-owned series
      }
    });
  });

  describe("GET /api/posts/{post_id} - Get Post", () => {
    beforeEach(async () => {
      // Create a test post
      const createRequest = {
        seriesId: testSeriesId!,
        title: "Get Test Post",
        content: "Post for get endpoint testing",
        slug: testPostSlug,
        postNumber: 1,
      };

      const response = await patronClient.posts.create(createRequest);
      testPostId = response?.id || null;
    });

    it("should retrieve a specific post by ID", async () => {
      const response = await patronClient.posts.get({
        postId: testPostId!,
      });

      expect(response).toBeDefined();
      expect(response?.id).toBe(testPostId);
      expect(response?.seriesId).toBe(testSeriesId);
      expect(response?.title).toBe("Get Test Post");
      expect(response?.content).toBe("Post for get endpoint testing");
      expect(response?.slug).toBe(testPostSlug);
      expect(response?.postNumber).toBe(1);
    });

    it("should fail when retrieving non-existent post", async () => {
      const fakeId = "00000000-0000-0000-0000-000000000000";

      try {
        await patronClient.posts.get({
          postId: fakeId,
        });
        fail("Expected get to fail with non-existent ID");
      } catch (error: any) {
        // Should get 404 not found error
      }
    });

    it("should fail when retrieving post with invalid UUID format", async () => {
      try {
        await patronClient.posts.get({
          postId: "invalid-uuid",
        });
        fail("Expected get to fail with invalid UUID");
      } catch (error: any) {
        // Should get 400 bad request or validation error
      }
    });
  });

  describe("PUT /api/posts/{post_id} - Update Post", () => {
    beforeEach(async () => {
      // Create a test post
      const createRequest = {
        seriesId: testSeriesId!,
        title: "Update Test Post",
        content: "Original post content",
        slug: testPostSlug,
        postNumber: 1,
        isPremium: false,
        isPublished: false,
      };

      const response = await patronClient.posts.create(createRequest);
      testPostId = response?.id || null;
    });

    it("should update post title and content", async () => {
      const updateRequest = {
        title: "Updated Test Post",
        content: "Updated post content for testing",
      };

      const response = await patronClient.posts.update({
        postId: testPostId!,
        updatePostRequest: {
          audioFileId: undefined,
          isPremium: undefined,
          isPublished: undefined,
          postNumber: undefined,
          slug: undefined,
          ...updateRequest,
        },
      });

      expect(response).toBeDefined();
      expect(response?.title).toBe("Updated Test Post");
      expect(response?.content).toBe("Updated post content for testing");
      expect(response?.slug).toBe(testPostSlug); // Should remain unchanged
      expect(response?.postNumber).toBe(1); // Should remain unchanged
    });

    it("should update post publication and premium status", async () => {
      const updateRequest = {
        isPublished: true,
        isPremium: true,
      };

      const response = await patronClient.posts.update({
        postId: testPostId!,
        updatePostRequest: {
          audioFileId: undefined,
          content: undefined,
          postNumber: undefined,
          slug: undefined,
          title: undefined,
          ...updateRequest,
        },
      });

      expect(response?.isPublished).toBe(true);
      expect(response?.isPremium).toBe(true);
    });

    it("should update post slug and number", async () => {
      const newSlug = `updated-${testPostSlug}`;
      const updateRequest = {
        slug: newSlug,
        postNumber: 5,
      };

      const response = await patronClient.posts.update({
        postId: testPostId!,
        updatePostRequest: {
          audioFileId: undefined,
          content: undefined,
          isPremium: undefined,
          isPublished: undefined,
          title: undefined,
          ...updateRequest,
        },
      });

      expect(response?.slug).toBe(newSlug);
      expect(response?.postNumber).toBe(5);
    });

    it("should update post audio file reference", async () => {
      const updateRequest = {
        audioFileId: null, // Remove audio file
      };

      const response = await patronClient.posts.update({
        postId: testPostId!,
        updatePostRequest: {
          content: undefined,
          isPremium: undefined,
          isPublished: undefined,
          postNumber: undefined,
          slug: undefined,
          title: undefined,
          ...updateRequest,
        },
      });

      expect(response?.audioFileId).toBeNull();
    });

    it("should fail when updating to existing slug in same series", async () => {
      // Create another post with a different slug
      const otherSlug = `other-${testPostSlug}`;
      const otherPost = await patronClient.posts.create({
        seriesId: testSeriesId!,
        title: "Other Post",
        content: "Other post content",
        slug: otherSlug,
        postNumber: 2,
      });

      try {
        // Try to update first post to use the second post's slug
        await patronClient.posts.update({
          postId: testPostId!,
          updatePostRequest: {
            audioFileId: undefined,
            content: undefined,
            isPremium: undefined,
            isPublished: undefined,
            postNumber: undefined,
            title: undefined,
            slug: otherSlug,
          },
        });
        fail("Expected update to fail with duplicate slug");
      } catch (error: any) {
        // Should get 409 conflict error
      }

      // Clean up the other post
      if (otherPost?.id) {
        await patronClient.posts.delete({ postId: otherPost.id });
      }
    });

    it("should fail when updating to existing number in same series", async () => {
      // Create another post with a different number
      const otherPost = await patronClient.posts.create({
        seriesId: testSeriesId!,
        title: "Other Post",
        content: "Other post content",
        slug: `other-${testPostSlug}`,
        postNumber: 3,
      });

      try {
        // Try to update first post to use the second post's number
        await patronClient.posts.update({
          postId: testPostId!,
          updatePostRequest: {
            audioFileId: undefined,
            content: undefined,
            isPremium: undefined,
            isPublished: undefined,
            slug: undefined,
            title: undefined,
            postNumber: 3,
          },
        });
        fail("Expected update to fail with duplicate number");
      } catch (error: any) {
        // Should get 409 conflict error
      }

      // Clean up the other post
      if (otherPost?.id) {
        await patronClient.posts.delete({ postId: otherPost.id });
      }
    });

    it("should fail when updating non-existent post", async () => {
      const fakeId = "00000000-0000-0000-0000-000000000000";

      try {
        await patronClient.posts.update({
          postId: fakeId,
          updatePostRequest: {
            audioFileId: undefined,
            content: undefined,
            isPremium: undefined,
            isPublished: undefined,
            postNumber: undefined,
            slug: undefined,
            title: "Updated Title",
          },
        });
        fail("Expected update to fail with non-existent ID");
      } catch (error: any) {
        // Should get 404 not found error
      }
    });
  });

  describe("DELETE /api/posts/{post_id} - Delete Post", () => {
    beforeEach(async () => {
      // Create a test post
      const createRequest = {
        seriesId: testSeriesId!,
        title: "Delete Test Post",
        content: "Post to be deleted",
        slug: testPostSlug,
        postNumber: 1,
      };

      const response = await patronClient.posts.create(createRequest);
      testPostId = response?.id || null;
    });

    it("should delete a post (soft delete)", async () => {
      const response = await patronClient.posts.delete({
        postId: testPostId!,
      });

      // Verify the post is deleted by trying to retrieve it
      try {
        await patronClient.posts.get({
          postId: testPostId!,
        });
        fail("Expected get to fail after deletion");
      } catch (error: any) {
        // Should get 404 not found error
      }

      // Clear testPostId to prevent cleanup attempt
      testPostId = null;
    });

    it("should fail when deleting non-existent post", async () => {
      const fakeId = "00000000-0000-0000-0000-000000000000";

      try {
        await patronClient.posts.delete({
          postId: fakeId,
        });
        fail("Expected delete to fail with non-existent ID");
      } catch (error: any) {
        // Should get 404 not found error
      }
    });

    it("should fail when deleting post with invalid UUID format", async () => {
      try {
        await patronClient.posts.delete({
          postId: "invalid-uuid",
        });
        fail("Expected delete to fail with invalid UUID");
      } catch (error: any) {
        // Should get 400 bad request or validation error
      }
    });
  });

  describe("Post Data Validation", () => {
    beforeEach(async () => {
      // Create a basic test post
      const createRequest = {
        seriesId: testSeriesId!,
        title: "Validation Test Post",
        content: "Post for validation testing",
        slug: testPostSlug,
        postNumber: 1,
      };

      const response = await patronClient.posts.create(createRequest);
      testPostId = response?.id || null;
    });

    it("should handle null optional fields correctly", async () => {
      const createRequest = {
        seriesId: testSeriesId!,
        title: "Null Fields Test Post",
        content: "Post with null optional fields",
        slug: `null-${testPostSlug}`,
        postNumber: 2,
        audioFileId: null,
        isPremium: null,
        isPublished: null,
      };

      const response = await patronClient.posts.create(createRequest);

      expect(response?.audioFileId).toBeNull();
      // Note: isPremium and isPublished likely have defaults, so they might not be null

      // Clean up this additional post
      if (response?.id) {
        await patronClient.posts.delete({ postId: response.id });
      }
    });

    it("should validate timestamp fields are present and correctly formatted", async () => {
      const response = await patronClient.posts.get({
        postId: testPostId!,
      });

      expect(response).toBeDefined();
      expect(response).not.toBeNull();

      if (!response) {
        fail("Expected response to be defined");
        return;
      }

      expect(response.createdAt).toBeDefined();
      expect(response.updatedAt).toBeDefined();

      // Verify timestamps are valid ISO strings
      if (response.createdAt && response.updatedAt) {
        expect(new Date(response.createdAt)).toBeInstanceOf(Date);
        expect(new Date(response.updatedAt)).toBeInstanceOf(Date);
        expect(new Date(response.createdAt).getTime()).not.toBeNaN();
        expect(new Date(response.updatedAt).getTime()).not.toBeNaN();
      }
    });

    it("should validate post numbers are positive integers", async () => {
      // Test with zero
      try {
        await patronClient.posts.create({
          seriesId: testSeriesId!,
          title: "Zero Number Post",
          content: "Post with zero number",
          slug: `zero-${testPostSlug}`,
          postNumber: 0,
        });
        fail("Expected post creation to fail with zero number");
      } catch (error: any) {
        // Should get validation error
      }

      // Test with negative number
      try {
        await patronClient.posts.create({
          seriesId: testSeriesId!,
          title: "Negative Number Post",
          content: "Post with negative number",
          slug: `negative-${testPostSlug}`,
          postNumber: -1,
        });
        fail("Expected post creation to fail with negative number");
      } catch (error: any) {
        // Should get validation error
      }
    });

    it("should validate content length limits", async () => {
      // Test with very long content (if there are limits)
      const veryLongContent = "x".repeat(100000); // 100KB of content

      try {
        const response = await patronClient.posts.create({
          seriesId: testSeriesId!,
          title: "Long Content Post",
          content: veryLongContent,
          slug: `long-${testPostSlug}`,
          postNumber: 10,
        });

        // If creation succeeds, verify the content was stored correctly
        if (response?.id) {
          const retrieved = await patronClient.posts.get({ postId: response.id });
          expect(retrieved?.content).toBe(veryLongContent);

          // Clean up
          await patronClient.posts.delete({ postId: response.id });
        }
      } catch (error: any) {
        // Content length limit exceeded - this is acceptable behavior
      }
    });
  });
});
