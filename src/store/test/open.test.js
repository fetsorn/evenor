import { describe, expect, test, vi } from "vitest";
import api from "@/api/index.js";
import { updateRecord, createRecord, selectStream } from "@/store/impure.js";
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
import stub from "./stub.js";

vi.mock("@/api/index.js", async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    default: {
      select: vi.fn(),
      clone: vi.fn(),
    },
  };
});

vi.mock("@/store/pure.js", async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    enrichBranchRecords: vi.fn(),
    schemaToBranchRecords: vi.fn(),
  };
});

vi.mock("@/store/record.js", async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    readSchema: vi.fn(),
    updateRepo: vi.fn(),
    createRoot: vi.fn(),
    saveRepoRecord: vi.fn(),
  };
});

describe("find", () => {
  test("throws on error", async () => {
    api.select.mockImplementation(async () => {
      throw Error("error");
    });

    expect(() => find(stub.reponame)).rejects.toThrowError();
  });

  test("finds a repo", async () => {
    const testCase = stub.cases.tags;

    api.select.mockImplementation(() => [testCase.record]);

    readSchema.mockImplementation(() => stub.schema);

    const result = await find(stub.reponame);

    expect(api.select).toHaveBeenCalledWith("root", {
      _: "repo",
      reponame: stub.reponame,
    });

    expect(result).toEqual({ schema: stub.schema, repo: testCase.record });
  });
});

describe("clone", () => {
  test("throws on error", async () => {
    const testCase = stub.cases.tags;

    crypto.subtle.digest = vi.fn(() => {
      throw Error("");
    });

    expect(() => clone(testCase.url, testCase.token)).rejects.toThrowError();
  });

  test("clones a repo", async () => {
    const testCase = stub.cases.tags;

    crypto.subtle.digest = vi.fn(() => stub.uuid);

    readSchema.mockImplementation(() => testCase.schema);

    schemaToBranchRecords.mockImplementation(() => [
      testCase.schemaRecord,
      testCase.metaRecords,
    ]);

    enrichBranchRecords.mockImplementation(() => testCase.branchRecords);

    const result = await clone(testCase.url, testCase.token);

    expect(createRoot).toHaveBeenCalled();

    expect(api.clone).toHaveBeenCalledWith(
      stub.uuid,
      testCase.url,
      testCase.token,
    );

    expect(readSchema).toHaveBeenCalledWith(stub.uuid);

    const c = {
      _: "repo",
      branch: [
        {
          _: "branch",
          branch: "branch1",
          leaves: ["branch2"],
          trunks: [],
        },
        {
          _: "branch",
          branch: "branch2",
          leaves: [],
          task: "date",
          trunks: ["branch1"],
        },
      ],
      remote_tag: {
        _: "remote_tag",
        remote_tag: "origin",
        remote_token: "token",
        remote_url: "https://example.com/reponame",
      },
      repo: "uuid",
      reponame: "reponame",
    };

    expect(updateRepo).toHaveBeenCalledWith(c);

    expect(saveRepoRecord).toHaveBeenCalledWith(c);

    expect(result).toEqual({ schema: testCase.schema, repo: c });
  });
});
