import { describe, expect, test, vi } from "vitest";
import api from "../api/index.js";
import {
  updateRecord,
  createRecord,
  cloneAndOpen,
  findAndOpen,
  repoFromURL,
  selectStream,
} from "./impure.js";
import {
  readSchema,
  createRoot,
  newUUID,
  updateRepo,
  updateEntry,
  deleteRecord,
  saveRepoRecord,
  loadRepoRecord,
} from "./record.js";
import {
  extractSchemaRecords,
  enrichBranchRecords,
  recordsToSchema,
  schemaToBranchRecords,
} from "./pure.js";
import { findAndOpen, cloneAndOpen } from "./open.js";
import stub from "./stub.js";

vi.mock("../api/index.js", async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    default: {
      select: vi.fn(),
      clone: vi.fn(),
    },
  };
});

vi.mock("./pure.js", async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    enrichBranchRecords: vi.fn(),
    schemaToBranchRecords: vi.fn(),
  };
});

vi.mock("./record.js", async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    readSchema: vi.fn(),
    updateRepo: vi.fn(),
    createRoot: vi.fn(),
    saveRepoRecord: vi.fn(),
  };
});

//describe("findAndOpen", () => {
//  test("does nothing on throw", async () => {
//    api.select.mockImplementation(() => {
//      throw Error("error");
//    });
//
//    expect(() => findAndOpen(stub.reponame)).not.toThrow();
//  });
//
//  test("finds a repo", async () => {
//    const testCase = stub.cases.tags;
//
//    api.select.mockImplementation(() => [testCase.record]);
//
//    readSchema.mockImplementation(() => stub.schema);
//
//    const result = await findAndOpen(stub.reponame);
//
//    expect(api.select).toHaveBeenCalledWith("root", {
//      _: "repo",
//      reponame: stub.reponame,
//    });
//
//    expect(result).toEqual({ schema: stub.schema, repo: testCase.record });
//  });
//});

describe("cloneAndOpen", () => {
  //test("does nothing on throw", async () => {
  //  const testCase = stub.cases.tags;

  //  createRoot.mockImplementation(() => {
  //    throw Error("error");
  //  });

  //  expect(() => cloneAndOpen(testCase.url, testCase.token)).not.toThrow();
  //});

  test("clones a repo", async () => {
    const testCase = stub.cases.tags;

    crypto.subtle.digest = vi.fn(() => stub.uuid);

    readSchema.mockImplementation(() => testCase.schema);

    schemaToBranchRecords.mockImplementation(() => [
      testCase.schemaRecord,
      testCase.metaRecords,
    ]);

    enrichBranchRecords.mockImplementation(() => testCase.branchRecords);

    const result = await cloneAndOpen(testCase.url, testCase.token);

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
