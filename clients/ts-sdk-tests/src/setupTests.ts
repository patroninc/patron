// Jest setup file for global test configuration
// This file is run before each test file

// Mock global fetch if needed
global.fetch = jest.fn();

// Global test setup
beforeEach(() => {
  jest.clearAllMocks();
});