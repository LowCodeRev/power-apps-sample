import * as matchers from "@testing-library/jest-dom/matchers";
import { expect, vi } from "vitest";

expect.extend(matchers);

// Mock the Power Apps SDK to prevent it from trying to connect in tests
vi.mock("@microsoft/power-apps/app", () => ({
  getContext: vi
    .fn()
    .mockRejectedValue(
      new Error("Power Apps SDK not available in test environment"),
    ),
}));

// Mock the Power Apps data SDK (used by generated services)
vi.mock("@microsoft/power-apps/data", () => ({
  getClient: vi.fn(() => ({
    createRecordAsync: vi.fn(),
    updateRecordAsync: vi.fn(),
    deleteRecordAsync: vi.fn(),
    retrieveRecordAsync: vi.fn(),
    retrieveMultipleRecordsAsync: vi.fn(),
    executeAsync: vi.fn(),
  })),
}));
