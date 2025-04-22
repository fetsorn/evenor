import { describe, expect, test, vi } from "vitest";
import api from "@/api/index.js";
import {
  updateRecord,
  createRecord,
  repoFromURL,
  selectStream,
} from "@/store/impure.js";
import {
  readSchema,
  createRoot,
  newUUID,
  updateRepo,
  updateEntry,
  deleteRecord,
  saveRepoRecord,
  loadRepoRecord,
} from "@/store/record.js";
import {
  extractSchemaRecords,
  enrichBranchRecords,
  recordsToSchema,
  schemaToBranchRecords,
} from "@/store/pure.js";
import { find, clone } from "@/store/open.js";
import schemaRoot from "@/store/default_root_schema.json";
import defaultRepoRecord from "@/store/default_repo_record.json";
import stub from "./stub.js";

vi.mock("@/api/index.js", async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    default: {
      createRepo: vi.fn(),
      deleteRecord: vi.fn(),
      updateRecord: vi.fn(),
      select: vi.fn(),
      selectStream: vi.fn(),
      commit: vi.fn(),
    },
  };
});

vi.mock("@/store/pure.js", async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    extractSchemaRecords: vi.fn(),
    enrichBranchRecords: vi.fn(),
    recordsToSchema: vi.fn(),
    schemaToBranchRecords: vi.fn(),
  };
});

vi.mock("@/store/open.js", async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    find: vi.fn(),
    clone: vi.fn(),
  };
});

vi.mock("@/store/record.js", async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    newUUID: vi.fn(),
    readSchema: vi.fn(),
    createRoot: vi.fn(),
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

describe("selectStream", () => {
  test("root", async () => {
    const testCase = stub.cases.baseValue;

    const appendRecord = vi.fn();

    api.selectStream.mockImplementation(() => ({
      strm: ReadableStream.from([{}]),
      closeHandler: vi.fn(),
    }));

    loadRepoRecord.mockReset();

    loadRepoRecord.mockImplementation(() => ({}));

    const { abortPreviousStream, startStream } = await selectStream(
      stub.schema,
      "root",
      appendRecord,
      new URLSearchParams(testCase.queryString),
    );

    // mock api.selectStream to return stub.record
    // call start stream and check stub.record
    await startStream();

    // check that loadRepoRecord() was called with stub.record
    expect(loadRepoRecord).toHaveBeenCalledWith({});
    // check that appendRecord was called with stub.record
    expect(appendRecord).toHaveBeenCalledWith({});
  });

  test("uuid", async () => {
    const testCase = stub.cases.baseValue;

    const appendRecord = vi.fn();

    api.selectStream.mockImplementation(() => ({
      strm: ReadableStream.from([{}]),
      closeHandler: vi.fn(),
    }));

    loadRepoRecord.mockReset();

    const { abortPreviousStream, startStream } = await selectStream(
      stub.schema,
      stub.uuid,
      appendRecord,
      new URLSearchParams(testCase.queryString),
    );

    // mock api.selectStream to return stub.record
    // call start stream and check stub.record
    await startStream();

    // check that appendRecord was called with stub.record
    expect(appendRecord).toHaveBeenCalledWith({});
    // check that loadRepoRecord() was called with stub.record
    expect(loadRepoRecord).not.toHaveBeenCalled();
  });
});
