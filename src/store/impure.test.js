import { describe, expect, test, vi } from "vitest";
import api from "../api/index.js";
import {
  updateRecord,
  readSchema,
  cloneAndOpen,
  findAndOpen,
  repoFromURL,
  createRoot,
  findRecord,
} from "./impure.js";
import {
  newUUID,
  updateRepo,
  updateEntry,
  deleteRecord,
  saveRepoRecord,
  loadRepoRecord,
} from "./foo.js";
import stub from "./stub.js";
import schemaRoot from "./default_root_schema.json";

vi.mock("../api/index.js", async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    default: {
      deleteRecord: vi.fn(),
      updateRecord: vi.fn(),
      select: vi.fn(),
      commit: vi.fn(),
    },
  };
});

vi.mock("./foo.js", async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    newUUID: vi.fn(),
    updateRepo: vi.fn(),
    updateEntry: vi.fn(),
    deleteRecord: vi.fn(),
    saveRepoRecord: vi.fn(),
    loadRepoRecord: vi.fn(),
  };
});

describe("updateRecord", () => {
  test("root", async () => {
    updateEntry.mockReset();

    saveRepoRecord.mockReset();

    await updateRecord("root", "repo", {});

    expect(updateRepo).toHaveBeenCalledWith("root", {});

    expect(saveRepoRecord).toHaveBeenCalledWith({});
  });

  test("uuid", async () => {
    updateEntry.mockReset();

    saveRepoRecord.mockReset();

    await updateRecord(stub.uuid, stub.trunk, {});

    expect(updateEntry).toHaveBeenCalledWith(stub.uuid, {});

    expect(saveRepoRecord).not.toHaveBeenCalled();
  });
});

describe("readSchema", () => {
  test("root", async () => {
    const schema = await readSchema("root");

    expect(schema).toEqual(schemaRoot);
  });

  test("uuid", async () => {
    const testCase = stub.cases.trunk;

    api.select
      .mockImplementationOnce(() => [testCase.schemaRecord])
      .mockImplementationOnce(() => testCase.branchRecords);

    const schema = await readSchema(stub.uuid);

    expect(api.select).toHaveBeenCalledWith(stub.uuid, { _: "_" });

    expect(api.select).toHaveBeenCalledWith(stub.uuid, { _: "branch" });
  });
});
