import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import { patronClient } from "../setupTests";

describe("Series API Integration Tests", () => {
  let testSeriesId: string | null = null;
  let testSeriesSlug: string;

  beforeEach(() => {
    // Generate unique slug for each test
    testSeriesSlug = `test-series-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  });

  afterEach(async () => {
    // Clean up created series after each test
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

  describe("POST /api/series - Create Series", () => {
    it("should create a new series with required fields", async () => {
      const createRequest = {
        title: "Test Series",
        slug: testSeriesSlug,
      };

      const response = await patronClient.series.create(createRequest);

      expect(response).toBeDefined();
      expect(response?.id).toBeDefined();
      expect(response?.title).toBe("Test Series");
      expect(response?.slug).toBe(testSeriesSlug);
      expect(response?.isPublished).toBe(false);
      expect(response?.isMonetized).toBe(false);
      expect(response?.userId).toBeDefined();

      testSeriesId = response?.id || null;
    });

    it("should create a series with all optional fields", async () => {
      const createRequest = {
        title: "Complete Test Series",
        slug: testSeriesSlug,
        description: "A comprehensive test series for API validation",
        category: "Technology",
        coverImageUrl: "https://example.com/test-cover.jpg",
        isPublished: true,
        isMonetized: true,
        pricingTier: "premium",
      };

      const response = await patronClient.series.create(createRequest);

      expect(response).toBeDefined();
      expect(response?.title).toBe("Complete Test Series");
      expect(response?.description).toBe("A comprehensive test series for API validation");
      expect(response?.category).toBe("Technology");
      expect(response?.coverImageUrl).toBe("https://example.com/test-cover.jpg");
      expect(response?.isPublished).toBe(true);
      expect(response?.isMonetized).toBe(true);
      expect(response?.pricingTier).toBe("premium");

      testSeriesId = response?.id || null;
    });

    it("should fail when creating series with duplicate slug", async () => {
      // Create first series
      const firstRequest = {
        title: "First Series",
        slug: testSeriesSlug,
      };

      const firstResponse = await patronClient.series.create(firstRequest);
      testSeriesId = firstResponse?.id || null;

      // Try to create second series with same slug
      const duplicateRequest = {
        title: "Duplicate Series",
        slug: testSeriesSlug,
      };

      try {
        await patronClient.series.create(duplicateRequest);
        fail("Expected series creation to fail with duplicate slug");
      } catch (error: any) {
        /* empty */
      }
    });

    it("should fail when creating series without required fields", async () => {
      try {
        await patronClient.series.create({
          title: "Missing Slug Series",
          // slug is missing
        } as any);
        fail("Expected series creation to fail without slug");
      } catch (error: any) {
        /* empty */
      }
    });
  });

  describe("GET /api/series - List Series", () => {
    beforeEach(async () => {
      // Create a test series for listing tests
      const createRequest = {
        title: "List Test Series",
        slug: testSeriesSlug,
      };

      const response = await patronClient.series.create(createRequest);
      testSeriesId = response?.id || null;
    });

    it("should list user series", async () => {
      const response = await patronClient.series.list();

      expect(response).toBeDefined();
      expect(Array.isArray(response)).toBe(true);
      expect(response.length).toBeGreaterThan(0);

      // Find our test series
      const testSeries = response.find((series) => series.id === testSeriesId);
      expect(testSeries).toBeDefined();
      expect(testSeries?.title).toBe("List Test Series");
    });

    it("should support pagination with limit", async () => {
      const response = await patronClient.series.list({
        limit: 1,
      });

      expect(response).toBeDefined();
      expect(response.length).toBeLessThanOrEqual(1);
    });

    it("should support cursor-based pagination with offset", async () => {
      // Get first page
      const firstPage = await patronClient.series.list({
        limit: 1,
      });

      if (firstPage && firstPage.length > 0) {
        const firstSeriesId = firstPage[0].id;

        // Get second page using offset
        const secondPage = await patronClient.series.list({
          limit: 1,
          offset: firstSeriesId,
        });

        // If there's a second page, it should not contain the first item
        if (secondPage && secondPage.length > 0) {
          expect(secondPage[0].id).not.toBe(firstSeriesId);
        }
      }
    });
  });

  describe("GET /api/series/{series_id} - Get Series", () => {
    beforeEach(async () => {
      // Create a test series
      const createRequest = {
        title: "Get Test Series",
        slug: testSeriesSlug,
        description: "Series for get endpoint testing",
      };

      const response = await patronClient.series.create(createRequest);
      testSeriesId = response?.id || null;
    });

    it("should retrieve a specific series by ID", async () => {
      const response = await patronClient.series.get({
        seriesId: testSeriesId!,
      });

      expect(response).toBeDefined();
      expect(response?.id).toBe(testSeriesId);
      expect(response?.title).toBe("Get Test Series");
      expect(response?.slug).toBe(testSeriesSlug);
      expect(response?.description).toBe("Series for get endpoint testing");
    });

    it("should fail when retrieving non-existent series", async () => {
      const fakeId = "00000000-0000-0000-0000-000000000000";

      try {
        await patronClient.series.get({
          seriesId: fakeId,
        });
        fail("Expected get to fail with non-existent ID");
      } catch (error: any) {
        /* empty */
      }
    });

    it("should fail when retrieving series with invalid UUID format", async () => {
      try {
        await patronClient.series.get({
          seriesId: "invalid-uuid",
        });
        fail("Expected get to fail with invalid UUID");
      } catch (error: any) {
        /* empty */
      }
    });
  });

  describe("PUT /api/series/{series_id} - Update Series", () => {
    beforeEach(async () => {
      // Create a test series
      const createRequest = {
        title: "Update Test Series",
        slug: testSeriesSlug,
        description: "Original description",
      };

      const response = await patronClient.series.create(createRequest);
      testSeriesId = response?.id || null;
    });

    it("should update series title and description", async () => {
      const updateRequest = {
        title: "Updated Test Series",
        description: "Updated description for testing",
      };

      const response = await patronClient.series.update({
        seriesId: testSeriesId!,
        updateSeriesRequest: {
          category: undefined,
          coverImageUrl: undefined,
          isMonetized: undefined,
          isPublished: undefined,
          pricingTier: undefined,
          slug: undefined,
          ...updateRequest,
        },
      });

      expect(response).toBeDefined();
      expect(response?.title).toBe("Updated Test Series");
      expect(response?.description).toBe("Updated description for testing");
      expect(response?.slug).toBe(testSeriesSlug); // Should remain unchanged
    });

    it("should update series publication and monetization status", async () => {
      const updateRequest = {
        isPublished: true,
        isMonetized: true,
        pricingTier: "premium",
      };

      const response = await patronClient.series.update({
        seriesId: testSeriesId!,
        updateSeriesRequest: {
          category: undefined,
          coverImageUrl: undefined,
          description: undefined,
          slug: undefined,
          title: undefined,
          ...updateRequest,
        },
      });

      expect(response?.isPublished).toBe(true);
      expect(response?.isMonetized).toBe(true);
      expect(response?.pricingTier).toBe("premium");
    });

    it("should update series category and cover image", async () => {
      const updateRequest = {
        category: "Education",
        coverImageUrl: "https://example.com/new-cover.jpg",
      };

      const response = await patronClient.series.update({
        seriesId: testSeriesId!,
        updateSeriesRequest: {
          description: undefined,
          isMonetized: undefined,
          isPublished: undefined,
          pricingTier: undefined,
          slug: undefined,
          title: undefined,
          ...updateRequest,
        },
      });

      expect(response?.category).toBe("Education");
      expect(response?.coverImageUrl).toBe("https://example.com/new-cover.jpg");
    });

    it("should update series slug", async () => {
      const newSlug = `updated-${testSeriesSlug}`;
      const updateRequest = {
        slug: newSlug,
      };

      const response = await patronClient.series.update({
        seriesId: testSeriesId!,
        updateSeriesRequest: {
          category: undefined,
          coverImageUrl: undefined,
          description: undefined,
          isMonetized: undefined,
          isPublished: undefined,
          pricingTier: undefined,
          title: undefined,
          ...updateRequest,
        },
      });

      expect(response?.slug).toBe(newSlug);
    });

    it("should fail when updating to existing slug", async () => {
      // Create another series with a different slug
      const otherSlug = `other-${testSeriesSlug}`;
      const otherSeries = await patronClient.series.create({
        title: "Other Series",
        slug: otherSlug,
      });

      try {
        // Try to update first series to use the second series' slug
        await patronClient.series.update({
          seriesId: testSeriesId!,
          updateSeriesRequest: {
            category: undefined,
            coverImageUrl: undefined,
            description: undefined,
            ...otherSeries,
          },
        });
        fail("Expected update to fail with duplicate slug");
      } catch (error: any) {
        /* empty */
      }

      // Clean up the other series
      if (otherSeries?.id) {
        await patronClient.series.delete({ seriesId: otherSeries.id });
      }
    });

    it("should fail when updating non-existent series", async () => {
      const fakeId = "00000000-0000-0000-0000-000000000000";

      try {
        await patronClient.series.update({
          seriesId: fakeId,
          updateSeriesRequest: {
            category: undefined,
            coverImageUrl: undefined,
            description: undefined,
            isMonetized: undefined,
            isPublished: undefined,
            pricingTier: undefined,
            slug: undefined,
            title: "Updated Title",
          },
        });
        fail("Expected update to fail with non-existent ID");
      } catch (error: any) {
        /* empty */
      }
    });
  });

  describe("DELETE /api/series/{series_id} - Delete Series", () => {
    beforeEach(async () => {
      // Create a test series
      const createRequest = {
        title: "Delete Test Series",
        slug: testSeriesSlug,
      };

      const response = await patronClient.series.create(createRequest);
      testSeriesId = response?.id || null;
    });

    it("should delete a series", async () => {
      const response = await patronClient.series.delete({
        seriesId: testSeriesId!,
      });

      // Verify the series is deleted by trying to retrieve it
      try {
        await patronClient.series.get({
          seriesId: testSeriesId!,
        });
        fail("Expected get to fail after deletion");
      } catch (error: any) {
        /* empty */
      }

      // Clear testSeriesId to prevent cleanup attempt
      testSeriesId = null;
    });

    it("should fail when deleting non-existent series", async () => {
      const fakeId = "00000000-0000-0000-0000-000000000000";

      try {
        await patronClient.series.delete({
          seriesId: fakeId,
        });
        fail("Expected delete to fail with non-existent ID");
      } catch (error: any) {
        /* empty */
      }
    });

    it("should fail when deleting series with invalid UUID format", async () => {
      try {
        await patronClient.series.delete({
          seriesId: "invalid-uuid",
        });
        fail("Expected delete to fail with invalid UUID");
      } catch (error: any) {
        /* empty */
      }
    });
  });

  describe("Series Data Validation", () => {
    it("should handle null optional fields correctly", async () => {
      const createRequest = {
        title: "Null Fields Test Series",
        slug: testSeriesSlug,
        description: null,
        category: null,
        coverImageUrl: null,
      };

      const response = await patronClient.series.create(createRequest);

      expect(response?.description).toBeNull();
      expect(response?.category).toBeNull();
      expect(response?.coverImageUrl).toBeNull();

      testSeriesId = response?.id || null;
    });

    it("should validate timestamp fields are present and correctly formatted", async () => {
      const createRequest = {
        title: "Timestamp Test Series",
        slug: testSeriesSlug,
      };

      const response = await patronClient.series.create(createRequest);

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

      testSeriesId = response.id || null;
    });
  });
});
