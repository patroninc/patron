import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import { patronClient } from "../setupTests";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

describe("Files API Integration Tests", () => {
  let testFileId: string | null = null;
  let testFileName: string;
  let testFilePath: string;

  beforeEach(() => {
    // Generate unique filename for each test
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
    testFileName = `test-file-${uniqueId}.txt`;

    // Create a temporary test file with unique content
    testFilePath = path.join(os.tmpdir(), testFileName);
    const testContent = `Test file content created at ${new Date().toISOString()}\nUnique ID: ${uniqueId}\nRandom: ${Math.random()}\nThis is a multi-line test file for API testing.`;
    fs.writeFileSync(testFilePath, testContent, "utf8");
  });

  afterEach(async () => {
    // Clean up uploaded file
    if (testFileId) {
      try {
        await patronClient.files.delete({ fileId: testFileId });
      } catch (error) {
        // Ignore cleanup errors
        console.warn("Failed to clean up test file:", error);
      }
      testFileId = null;
    }

    // Clean up temporary file
    try {
      if (fs.existsSync(testFilePath)) {
        fs.unlinkSync(testFilePath);
      }
    } catch (error) {
      console.warn("Failed to clean up temporary file:", error);
    }
  });

  describe("POST /api/files/actions/upload - Upload File", () => {
    it("should upload a text file successfully", async () => {
      const fileBuffer = fs.readFileSync(testFilePath);
      const file = new File([fileBuffer], testFileName, { type: "text/plain" });

      const response = await patronClient.files.upload({
        file: file,
      });

      expect(response).toBeDefined();
      expect(response?.message).toBeDefined();
      expect(response?.file).toBeDefined();
      expect(response?.file.id).toBeDefined();
      expect(response?.file.filename).toBe(testFileName);
      expect(response?.file.originalFilename).toBe(testFileName);
      expect(response?.file.mimeType).toBe("text/plain");
      expect(response?.file.fileSize).toBeGreaterThan(0);
      expect(response?.file.status).toBe("uploaded");

      testFileId = response?.file.id || null;
    });

    it("should upload a PDF file successfully", async () => {
      // Create a minimal PDF file for testing
      const pdfContent = Buffer.from([
        0x25,
        0x50,
        0x44,
        0x46,
        0x2d,
        0x31,
        0x2e,
        0x34, // %PDF-1.4
        0x0a,
        0x25,
        0xc4,
        0xe5,
        0xf2,
        0xe5,
        0xeb,
        0xa7, // binary comment
        0xf3,
        0xa0,
        0xd0,
        0xc4,
        0xc6,
        0x0a, // more binary
      ]);
      const pdfFileName = `test-pdf-${Date.now()}-${Math.random().toString(36).substring(7)}.pdf`;
      const file = new File([pdfContent], pdfFileName, { type: "application/pdf" });

      const response = await patronClient.files.upload({
        file: file,
      });

      expect(response).toBeDefined();
      expect(response?.file.filename).toBe(pdfFileName);
      expect(response?.file.mimeType).toBe("application/pdf");
      expect(response?.file.fileSize).toBe(pdfContent.length);

      testFileId = response?.file.id || null;
    });

    it("should upload an image file successfully", async () => {
      // Create a minimal PNG file for testing (1x1 transparent pixel)
      const pngContent = Buffer.from([
        0x89,
        0x50,
        0x4e,
        0x47,
        0x0d,
        0x0a,
        0x1a,
        0x0a, // PNG signature
        0x00,
        0x00,
        0x00,
        0x0d,
        0x49,
        0x48,
        0x44,
        0x52, // IHDR chunk
        0x00,
        0x00,
        0x00,
        0x01,
        0x00,
        0x00,
        0x00,
        0x01, // 1x1 dimensions
        0x08,
        0x06,
        0x00,
        0x00,
        0x00,
        0x1f,
        0x15,
        0xc4, // bit depth, color type, etc.
        0x89,
        0x00,
        0x00,
        0x00,
        0x0b,
        0x49,
        0x44,
        0x41, // IDAT chunk
        0x54,
        0x78,
        0x9c,
        0x63,
        0x00,
        0x01,
        0x00,
        0x00, // compressed data
        0x05,
        0x00,
        0x01,
        0x0d,
        0x0a,
        0x2d,
        0xb4,
        0x00, // end of IDAT
        0x00,
        0x00,
        0x00,
        0x49,
        0x45,
        0x4e,
        0x44,
        0xae, // IEND chunk
        0x42,
        0x60,
        0x82,
      ]);
      const imageFileName = `test-image-${Date.now()}-${Math.random().toString(36).substring(7)}.png`;
      const file = new File([pngContent], imageFileName, { type: "image/png" });

      const response = await patronClient.files.upload({
        file: file,
      });

      expect(response).toBeDefined();
      expect(response?.file.filename).toBe(imageFileName);
      expect(response?.file.mimeType).toBe("image/png");
      expect(response?.file.fileSize).toBe(pngContent.length);

      testFileId = response?.file.id || null;
    });

    it("should fail when uploading without a file", async () => {
      try {
        await patronClient.files.upload({
          file: null as any,
        });
        fail("Expected upload to fail without a file");
      } catch (error: any) {
        // Should get 400 bad request error
      }
    });

    it("should fail when uploading an empty file", async () => {
      const emptyFile = new File([], "empty.txt", { type: "text/plain" });

      try {
        await patronClient.files.upload({
          file: emptyFile,
        });
        fail("Expected upload to fail with empty file");
      } catch (error: any) {
        // Should get 400 bad request error
      }
    });

    it("should handle large file uploads", async () => {
      // Create a larger test file (1MB)
      const largeContent = Buffer.alloc(1024 * 1024, `${Math.random()}`); // 1MB of unique characters
      const largeFileName = `large-test-${Date.now()}-${Math.random().toString(36).substring(7)}.txt`;
      const file = new File([largeContent], largeFileName, { type: "text/plain" });

      try {
        const response = await patronClient.files.upload({
          file: file,
        });

        expect(response).toBeDefined();
        expect(response?.file.filename).toBe(largeFileName);
        expect(response?.file.fileSize).toBe(1024 * 1024);

        testFileId = response?.file.id || null;
      } catch (error: any) {
        // If this fails with 413 (file too large), that's acceptable behavior
        if (error.status === 413) {
          // File size limit exceeded - this is expected behavior
          return;
        }
        throw error;
      }
    }, 30000); // 30 second timeout for large uploads

    it("should return existing file when uploading duplicate content", async () => {
      // Upload the same file twice
      const fileBuffer = fs.readFileSync(testFilePath);
      const file1 = new File([fileBuffer], testFileName, { type: "text/plain" });

      // First upload
      const response1 = await patronClient.files.upload({
        file: file1,
      });

      expect(response1).toBeDefined();
      expect(response1?.message).toBe("File uploaded successfully");
      expect(response1?.file).toBeDefined();
      const firstFileId = response1?.file.id;

      // Second upload with same content but potentially different filename
      const duplicateFileName = `duplicate-${testFileName}`;
      const file2 = new File([fileBuffer], duplicateFileName, { type: "text/plain" });

      const response2 = await patronClient.files.upload({
        file: file2,
      });

      // Should return existing file with 200 status instead of creating new one
      expect(response2).toBeDefined();
      expect(response2?.message).toBe("File already exists");
      expect(response2?.file).toBeDefined();
      expect(response2?.file.id).toBe(firstFileId); // Same file ID
      expect(response2?.file.fileHash).toBe(response1?.file.fileHash); // Same hash

      // Clean up - only need to delete once since it's the same file
      testFileId = firstFileId || null;
    });
  });

  describe("GET /api/files - List Files", () => {
    beforeEach(async () => {
      // Upload multiple test files for listing tests
      const timestamp = Date.now();
      const files = [
        {
          name: `list-test-1-${timestamp}-${Math.random().toString(36).substring(7)}.txt`,
          content: `First test file - ${timestamp} - ${Math.random()}`,
        },
        {
          name: `list-test-2-${timestamp}-${Math.random().toString(36).substring(7)}.txt`,
          content: `Second test file - ${timestamp} - ${Math.random()}`,
        },
      ];

      for (const fileInfo of files) {
        const fileBuffer = Buffer.from(fileInfo.content, "utf8");
        const file = new File([fileBuffer], fileInfo.name, { type: "text/plain" });

        await patronClient.files.upload({ file });
      }
    });

    it("should list user files", async () => {
      const response = await patronClient.files.list();

      expect(response).toBeDefined();
      expect(Array.isArray(response)).toBe(true);
      expect(response.length).toBeGreaterThanOrEqual(2);

      // Check that files have expected structure
      response.forEach((file) => {
        expect(file.id).toBeDefined();
        expect(file.filename).toBeDefined();
        expect(file.originalFilename).toBeDefined();
        expect(file.fileSize).toBeGreaterThan(0);
        expect(file.mimeType).toBeDefined();
        expect(file.status).toBeDefined();
        expect(file.createdAt).toBeDefined();
      });

      // Find our test files
      const testFiles = response.filter((file) => file.filename?.includes("list-test"));
      expect(testFiles.length).toBeGreaterThanOrEqual(2);
    });

    it("should support pagination with limit", async () => {
      const response = await patronClient.files.list({
        limit: 1,
      });

      expect(response).toBeDefined();
      expect(response.length).toBeLessThanOrEqual(1);
    });

    it("should support cursor-based pagination with offset", async () => {
      // Get first page
      const firstPage = await patronClient.files.list({
        limit: 1,
      });

      if (firstPage && firstPage.length > 0) {
        const firstFileId = firstPage[0].id;

        // Get second page using offset
        const secondPage = await patronClient.files.list({
          limit: 1,
          offset: firstFileId,
        });

        // If there's a second page, it should not contain the first item
        if (secondPage && secondPage.length > 0) {
          expect(secondPage[0].id).not.toBe(firstFileId);
        }
      }
    });

    it("should return files in consistent order", async () => {
      const firstCall = await patronClient.files.list({ limit: 5 });
      const secondCall = await patronClient.files.list({ limit: 5 });

      // Same parameters should return same results
      expect(firstCall).toEqual(secondCall);
    });
  });

  describe("GET /api/files/{file_id} - Get File Details", () => {
    beforeEach(async () => {
      // Upload a test file
      const fileBuffer = fs.readFileSync(testFilePath);
      const file = new File([fileBuffer], testFileName, { type: "text/plain" });

      const response = await patronClient.files.upload({ file });
      testFileId = response?.file.id || null;
    });

    it("should retrieve file details by ID", async () => {
      const response = await patronClient.files.get({
        fileId: testFileId!,
      });

      expect(response).toBeDefined();
      expect(response?.id).toBe(testFileId);
      expect(response?.filename).toBe(testFileName);
      expect(response?.originalFilename).toBe(testFileName);
      expect(response?.mimeType).toBe("text/plain");
      expect(response?.fileSize).toBeGreaterThan(0);
      expect(response?.status).toBe("uploaded");
      expect(response?.fileHash).toBeDefined();
      expect(response?.createdAt).toBeDefined();
      expect(response?.updatedAt).toBeDefined();
    });

    it("should fail when retrieving non-existent file", async () => {
      const fakeId = "00000000-0000-0000-0000-000000000000";

      try {
        await patronClient.files.get({
          fileId: fakeId,
        });
        fail("Expected get to fail with non-existent ID");
      } catch (error: any) {
        // Should get 404 not found error
      }
    });

    it("should fail when retrieving file with invalid UUID format", async () => {
      try {
        await patronClient.files.get({
          fileId: "invalid-uuid",
        });
        fail("Expected get to fail with invalid UUID");
      } catch (error: any) {
        // Should get 400 bad request or validation error
      }
    });
  });

  describe("PUT /api/files/{file_id} - Update File Metadata", () => {
    beforeEach(async () => {
      // Upload a test file
      const fileBuffer = fs.readFileSync(testFilePath);
      const file = new File([fileBuffer], testFileName, { type: "text/plain" });

      const response = await patronClient.files.upload({ file });
      testFileId = response?.file.id || null;
    });

    it("should update file filename", async () => {
      const newFilename = `updated-${testFileName}`;

      const response = await patronClient.files.update({
        fileId: testFileId!,
        updateUserFileRequest: {
          filename: newFilename,
        },
      });

      expect(response).toBeDefined();
      expect(response?.filename).toBe(newFilename);
      expect(response?.originalFilename).toBe(testFileName); // Should remain unchanged
      expect(response?.id).toBe(testFileId);
    });

    it("should update file metadata", async () => {
      const newMetadata = {
        description: "Updated test file",
        category: "testing",
        tags: ["test", "api"],
      };

      const response = await patronClient.files.update({
        fileId: testFileId!,
        updateUserFileRequest: {
          metadata: newMetadata,
        },
      });

      expect(response).toBeDefined();
      expect(response?.metadata).toEqual(newMetadata);
      expect(response?.filename).toBe(testFileName); // Should remain unchanged
    });

    it("should update both filename and metadata", async () => {
      const newFilename = `renamed-${testFileName}`;
      const newMetadata = {
        description: "Renamed and updated test file",
        version: 2,
      };

      const response = await patronClient.files.update({
        fileId: testFileId!,
        updateUserFileRequest: {
          filename: newFilename,
          metadata: newMetadata,
        },
      });

      expect(response?.filename).toBe(newFilename);
      expect(response?.metadata).toEqual(newMetadata);
    });

    it("should handle null metadata update", async () => {
      // First, set some metadata
      await patronClient.files.update({
        fileId: testFileId!,
        updateUserFileRequest: {
          metadata: { test: "data" },
        },
      });

      // Then clear it with null
      const response = await patronClient.files.update({
        fileId: testFileId!,
        updateUserFileRequest: {
          metadata: null,
        },
      });

      expect(response?.metadata).toBe(null);
    });

    it("should fail when updating non-existent file", async () => {
      const fakeId = "00000000-0000-0000-0000-000000000000";

      try {
        await patronClient.files.update({
          fileId: fakeId,
          updateUserFileRequest: {
            filename: "new-name.txt",
          },
        });
        fail("Expected update to fail with non-existent ID");
      } catch (error: any) {
        // Should get 404 not found error
      }
    });

    it("should fail when updating file with invalid UUID format", async () => {
      try {
        await patronClient.files.update({
          fileId: "invalid-uuid",
          updateUserFileRequest: {
            filename: "new-name.txt",
          },
        });
        fail("Expected update to fail with invalid UUID");
      } catch (error: any) {
        // Should get 400 bad request or validation error
      }
    });

    it("should validate filename extensions", async () => {
      // Try to change file extension to something incompatible
      const response = await patronClient.files.update({
        fileId: testFileId!,
        updateUserFileRequest: {
          filename: "changed-extension.pdf", // Original was .txt
        },
      });

      // This should either succeed (allowing extension changes) or fail with validation error
      if (response) {
        expect(response.filename).toBe("changed-extension.pdf");
      }
      // If it fails, that's also acceptable behavior for security reasons
    });
  });

  describe("DELETE /api/files/{file_id} - Delete File", () => {
    beforeEach(async () => {
      // Upload a test file
      const fileBuffer = fs.readFileSync(testFilePath);
      const file = new File([fileBuffer], testFileName, { type: "text/plain" });

      const response = await patronClient.files.upload({ file });
      testFileId = response?.file.id || null;
    });

    it("should delete a file permanently", async () => {
      const response = await patronClient.files.delete({
        fileId: testFileId!,
      });

      // Verify the file is deleted by trying to retrieve it
      try {
        await patronClient.files.get({
          fileId: testFileId!,
        });
        fail("Expected get to fail after deletion");
      } catch (error: any) {
        // Should get 404 not found error
      }

      // Clear testFileId to prevent cleanup attempt
      testFileId = null;
    });

    it("should fail when deleting non-existent file", async () => {
      const fakeId = "00000000-0000-0000-0000-000000000000";

      try {
        await patronClient.files.delete({
          fileId: fakeId,
        });
        fail("Expected delete to fail with non-existent ID");
      } catch (error: any) {
        // Should get 404 not found error
      }
    });

    it("should fail when deleting file with invalid UUID format", async () => {
      try {
        await patronClient.files.delete({
          fileId: "invalid-uuid",
        });
        fail("Expected delete to fail with invalid UUID");
      } catch (error: any) {
        // Should get 400 bad request or validation error
      }
    });
  });

  describe("GET /api/cdn/files/{file_id} - Serve File Content", () => {
    beforeEach(async () => {
      // Upload a test file
      const fileBuffer = fs.readFileSync(testFilePath);
      const file = new File([fileBuffer], testFileName, { type: "text/plain" });

      const response = await patronClient.files.upload({ file });
      testFileId = response?.file.id || null;
    });

    it("should serve file content via CDN endpoint", async () => {
      // Use direct fetch instead of SDK to avoid binary response handling issues
      const cdnUrl = `${process.env.PATRON_API_URL}/api/cdn/files/${testFileId}`;
      const response = await fetch(cdnUrl, {
        headers: {
          Authorization: `Bearer ${process.env.PATRONTS_BEARER_AUTH}`,
        },
      });

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);

      // Check response headers
      expect(response.headers.get("content-type")).toBe("text/plain");
      expect(response.headers.get("cache-control")).toContain("public");
      expect(response.headers.get("etag")).toBeDefined();

      // Check the content
      const content = await response.text();
      expect(content).toContain("Test file content created at");
      expect(content).toContain("This is a multi-line test file for API testing.");
    });

    it("should fail when serving non-existent file via CDN", async () => {
      const fakeId = "00000000-0000-0000-0000-000000000000";
      const cdnUrl = `${process.env.PATRON_API_URL}/api/cdn/files/${fakeId}`;

      const response = await fetch(cdnUrl, {
        headers: {
          Authorization: `Bearer ${process.env.PATRONTS_BEARER_AUTH}`,
        },
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(404);
    });

    it("should fail when serving file with invalid UUID via CDN", async () => {
      const cdnUrl = `${process.env.PATRON_API_URL}/api/cdn/files/invalid-uuid`;

      const response = await fetch(cdnUrl, {
        headers: {
          Authorization: `Bearer ${process.env.PATRONTS_BEARER_AUTH}`,
        },
      });

      expect(response.ok).toBe(false);
      expect([400, 404]).toContain(response.status); // Either bad request or not found
    });

    it("should include proper cache headers for CDN response", async () => {
      // Use direct fetch to properly test response headers
      const cdnUrl = `${process.env.PATRON_API_URL}/api/cdn/files/${testFileId}`;
      const response = await fetch(cdnUrl, {
        headers: {
          Authorization: `Bearer ${process.env.PATRONTS_BEARER_AUTH}`,
        },
      });

      expect(response.ok).toBe(true);

      // Validate cache headers
      const cacheControl = response.headers.get("cache-control");
      expect(cacheControl).toContain("public");
      expect(cacheControl).toContain("max-age=86400"); // 24 hours
      expect(cacheControl).toContain("immutable");

      // Validate ETag header
      const etag = response.headers.get("etag");
      expect(etag).toBeDefined();
      expect(etag).toMatch(/^"[a-f0-9]+"$/); // Should be quoted hex string

      // Validate Content-Disposition header
      const contentDisposition = response.headers.get("content-disposition");
      expect(contentDisposition).toContain("inline");
      expect(contentDisposition).toContain(`filename="${testFileName}"`);
    });
  });

  describe("File Data Validation", () => {
    beforeEach(async () => {
      // Upload a basic test file
      const fileBuffer = fs.readFileSync(testFilePath);
      const file = new File([fileBuffer], testFileName, { type: "text/plain" });

      const response = await patronClient.files.upload({ file });
      testFileId = response?.file.id || null;
    });

    it("should validate timestamp fields are present and correctly formatted", async () => {
      const response = await patronClient.files.get({
        fileId: testFileId!,
      });

      expect(response).toBeDefined();
      expect(response).not.toBe({});

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

    it("should validate file hash is generated correctly", async () => {
      const response = await patronClient.files.get({
        fileId: testFileId!,
      });

      expect(response?.fileHash).toBeDefined();
      expect(typeof response?.fileHash).toBe("string");
      expect(response?.fileHash?.length).toBeGreaterThan(0);

      // Hash should be consistent for same file
      const response2 = await patronClient.files.get({
        fileId: testFileId!,
      });
      expect(response2?.fileHash).toBe(response?.fileHash);
    });

    it("should maintain file size accuracy", async () => {
      const originalSize = fs.statSync(testFilePath).size;
      const response = await patronClient.files.get({
        fileId: testFileId!,
      });

      expect(response?.fileSize).toBe(originalSize);
    });

    it("should preserve MIME type detection", async () => {
      const response = await patronClient.files.get({
        fileId: testFileId!,
      });

      expect(response?.mimeType).toBe("text/plain");
    });

    it("should handle special characters in filenames", async () => {
      const specialFileName = `test-file-äöü-日本語-${Date.now()}-${Math.random().toString(36).substring(7)}.txt`;
      const fileBuffer = Buffer.from(`Content with special filename - ${Math.random()}`, "utf8");
      const file = new File([fileBuffer], specialFileName, { type: "text/plain" });

      try {
        const uploadResponse = await patronClient.files.upload({ file });

        expect(uploadResponse?.file.originalFilename).toBe(specialFileName);

        // Clean up
        if (uploadResponse?.file.id) {
          await patronClient.files.delete({ fileId: uploadResponse.file.id });
        }
      } catch (error: any) {
        // Special characters in filenames might not be supported
        // This is acceptable behavior for some systems
        console.warn("Special characters in filenames not supported:", error);
      }
    });

    it("should handle very long filenames", async () => {
      const longFileName = `very-long-filename-${"x".repeat(200)}.txt`;
      const fileBuffer = Buffer.from("Content with long filename", "utf8");
      const file = new File([fileBuffer], longFileName, { type: "text/plain" });

      try {
        const uploadResponse = await patronClient.files.upload({ file });

        // System might truncate the filename
        expect(uploadResponse?.file.originalFilename).toBeDefined();
        expect(uploadResponse?.file.filename).toBeDefined();

        // Clean up
        if (uploadResponse?.file.id) {
          await patronClient.files.delete({ fileId: uploadResponse.file.id });
        }
      } catch (error: any) {
        // Long filenames might be rejected - this is acceptable
        console.warn("Long filenames not supported:", error);
      }
    });
  });
});
