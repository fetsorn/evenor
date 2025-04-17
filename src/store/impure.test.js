import { describe, expect, test, vi } from "vitest";
import api from "../api/index.js";
import {
  updateRecord,
  createRecord,
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
import {
  extractSchemaRecords,
  enrichBranchRecords,
  recordsToSchema,
  schemaToBranchRecords,
} from "./pure.js";
import stub from "./stub.js";
import schemaRoot from "./default_root_schema.json";
import defaultRepoRecord from "./default_repo_record.json";

vi.mock("../api/index.js", async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    default: {
      createRepo: vi.fn(),
      deleteRecord: vi.fn(),
      updateRecord: vi.fn(),
      select: vi.fn(),
      commit: vi.fn(),
    },
  };
});

vi.mock("./pure.js", async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    extractSchemaRecords: vi.fn(),
    enrichBranchRecords: vi.fn(),
    recordsToSchema: vi.fn(),
    schemaToBranchRecords: vi.fn(),
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

    expect(updateRepo).toHaveBeenCalledWith({});

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

describe("createRecord", () => {
  newUUID.mockImplementation(() => stub.uuid);

  test("root", async () => {
    const record = await createRecord("root", "repo");

    expect(record).toEqual({
      _: "repo",
      repo: stub.uuid,
      ...defaultRepoRecord,
    });
  });

  test("uuid", async () => {
    const record = await createRecord(stub.uuid, stub.trunk);

    expect(record).toEqual({ _: stub.trunk, [stub.trunk]: stub.uuid });
  });
});

describe("createRoot", () => {
  test("", async () => {
    const testCase = stub.cases.trunk;

    schemaToBranchRecords.mockImplementation(() => testCase.branchRecords);

    await createRoot();

    expect(api.createRepo).toHaveBeenCalledWith("root");

    for (const branchRecord of testCase.branchRecords) {
      expect(api.updateRecord).toHaveBeenCalledWith("root", branchRecord);
    }

    expect(api.commit).toHaveBeenCalledWith("root");
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
