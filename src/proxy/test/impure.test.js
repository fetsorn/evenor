import { describe, expect, test, vi } from "vitest";
import { updateRecord } from "@/proxy/impure.js";
import { newUUID } from "@/proxy/record.js";
import {
  saveMindRecord,
  loadMindRecord,
  updateMind,
  updateEntry,
} from "@/proxy/record.js";
import stub from "./stub.js";

vi.mock("@/proxy/pure.js", async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    extractSchemaRecords: vi.fn(),
    enrichBranchRecords: vi.fn(),
    schemaToBranchRecords: vi.fn(),
  };
});

vi.mock("@/proxy/open.js", async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    find: vi.fn(),
    clone: vi.fn(),
  };
});

vi.mock("@/proxy/record.js", async (importOriginal) => {
  const mod = await importOriginal();

  return {
    newUUID: vi.fn(),
  };
});

vi.mock("@/proxy/record.js", async (importOriginal) => {
  const mod = await importOriginal();

  return {
    saveMindRecord: vi.fn(),
    loadMindRecord: vi.fn(),
    createRoot: vi.fn(),
    updateMind: vi.fn(),
    updateEntry: vi.fn(),
    deleteRecord: vi.fn(),
  };
});

describe("updateRecord", () => {
  test("root", async () => {
    updateEntry.mockReset();

    saveMindRecord.mockReset();

    const api = {};

    const record = { _: "mind" };

    await updateRecord(api, "root", record);

    expect(saveMindRecord).toHaveBeenCalledWith(api, record);
  });

  test("id", async () => {
    updateEntry.mockReset();

    saveMindRecord.mockReset();

    const api = {};

    await updateRecord(api, stub.id, {});

    expect(updateEntry).toHaveBeenCalledWith(api, stub.id, {});

    expect(saveMindRecord).not.toHaveBeenCalled();
  });
});
