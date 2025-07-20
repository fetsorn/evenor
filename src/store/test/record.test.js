import { describe, expect, test, vi } from "vitest";
import { sha256 } from "js-sha256";
import api from "@/api/index.js";
import {
  newUUID,
  updateRepo,
  updateEntry,
  deleteRecord,
  readSchema,
  createRoot,
  saveRepoRecord,
  loadRepoRecord,
} from "@/store/record.js";
import {
  readRemoteTags,
  readLocalTags,
  writeRemoteTags,
  writeLocalTags,
} from "@/store/tags.js";
import { schemaToBranchRecords } from "@/store/pure.js";
import schemaRoot from "@/store/default_root_schema.json";
import stub from "./stub.js";

vi.mock("@/api/index.js", async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    default: {
      init: vi.fn(),
      deleteRecord: vi.fn(),
      updateRecord: vi.fn(),
      createLFS: vi.fn(),
      select: vi.fn(),
      commit: vi.fn(),
    },
  };
});

vi.mock("@/store/pure.js", async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    schemaToBranchRecords: vi.fn(),
  };
});

vi.mock("@/store/tags.js", async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    readRemoteTags: vi.fn(),
    readLocalTags: vi.fn(),
    writeRemoteTags: vi.fn(),
    writeLocalTags: vi.fn(),
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

    expect(schema).toStrictEqual(schemaRoot);
  });

  test("uuid", async () => {
    const testCase = stub.cases.trunk;

    api.select
      .mockImplementationOnce(() => [testCase.schemaRecord])
      .mockImplementationOnce(() => testCase.branchRecords);

    const schema = await readSchema(stub.uuid);

    expect(api.select).toHaveBeenCalledWith(stub.uuid, { _: "_" });

    expect(api.select).toHaveBeenCalledWith(stub.uuid, { _: "branch" });

    expect(schema).toStrictEqual(testCase.schema);
  });
});

describe("createRoot", () => {
  test("", async () => {
    const testCase = stub.cases.trunk;

    schemaToBranchRecords.mockImplementation(() => testCase.branchRecords);

    await createRoot();

    expect(api.init).toHaveBeenCalledWith("root");

    for (const branchRecord of testCase.branchRecords) {
      expect(api.updateRecord).toHaveBeenCalledWith("root", branchRecord);
    }

    expect(api.commit).toHaveBeenCalledWith("root");
  });
});

describe("saveRepoRecord", () => {
  test("", async () => {
    const testCase = stub.cases.tags;

    api.init.mockReset();

    await saveRepoRecord(testCase.record);

    expect(api.init).toHaveBeenCalledWith(stub.uuid, stub.reponame);

    expect(api.createLFS).toHaveBeenCalledWith(stub.uuid);

    expect(api.updateRecord).toHaveBeenCalledWith(
      stub.uuid,
      testCase.schemaRecord,
    );

    for (const metaRecord of testCase.metaRecords) {
      expect(api.updateRecord).toHaveBeenCalledWith(stub.uuid, metaRecord);
    }

    expect(writeRemoteTags).toHaveBeenCalledWith(stub.uuid, [
      testCase.originUrl,
    ]);

    expect(writeLocalTags).toHaveBeenCalledWith(stub.uuid, [testCase.localTag]);

    expect(api.commit).toHaveBeenCalledWith(stub.uuid);
  });
});

describe("loadRepoRecord", () => {
  test("", async () => {
    const testCase = stub.cases.tags;

    api.select
      .mockImplementationOnce(() => [testCase.schemaRecord])
      .mockImplementationOnce(() => testCase.branchRecords);

    readRemoteTags.mockImplementation(() => [testCase.originUrl]);

    readLocalTags.mockImplementation(() => [testCase.localTag]);

    const record = await loadRepoRecord(testCase.record);

    expect(record).toStrictEqual(testCase.record);
  });
});
