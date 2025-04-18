import { describe, expect, test, vi } from "vitest";
import { sha256 } from "js-sha256";
import api from "../api/index.js";
import {
  newUUID,
  updateRepo,
  updateEntry,
  deleteRecord,
  readSchema,
  createRoot,
} from "./foo.js";
import {
  extractSchemaRecords,
  enrichBranchRecords,
  recordsToSchema,
  schemaToBranchRecords,
  searchParamsToQuery,
} from "./pure.js";
import schemaRoot from "./default_root_schema.json";
import stub from "./stub.js";

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

describe("newUUID", () => {
  vi.mock("js-sha256", async (importOriginal) => {
    const mod = await importOriginal();

    return {
      ...mod,
      sha256: vi.fn(() => 1),
    };
  });

  test("generates a uuid", () => {
    const uuid = newUUID();

    expect(sha256).toHaveBeenCalled();

    expect(uuid).toBe(1);
  });
});

describe("deleteRecord", () => {
  test("", async () => {
    await deleteRecord("repo", {});

    expect(api.deleteRecord).toHaveBeenCalledWith("repo", {});

    expect(api.commit).toHaveBeenCalledWith("repo");
  });
});

describe("updateRepo", () => {
  test("", async () => {
    await updateRepo({});

    expect(api.updateRecord).toHaveBeenCalledWith("root", {});

    expect(api.commit).toHaveBeenCalledWith("root");
  });
});

describe("updateEntry", () => {
  test("", async () => {
    await updateEntry("repo", {});

    expect(api.updateRecord).toHaveBeenCalledWith("repo", {});

    expect(api.commit).toHaveBeenCalledWith("repo");
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
