import { describe, expect, test, vi } from "vitest";
import {
  saveRecord,
  editRecord,
  wipeRecord,
  changeRepo,
  search,
} from "@/store/action.js";

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

describe("editRecord", () => {
  //test("root", async () => {
  //  updateEntry.mockReset();
  //  saveRepoRecord.mockReset();
  //  await updateRecord("root", "repo", {});
  //  expect(updateRepo).toHaveBeenCalledWith({});
  //  expect(saveRepoRecord).toHaveBeenCalledWith({});
  //});
  //test("uuid", async () => {
  //  updateEntry.mockReset();
  //  saveRepoRecord.mockReset();
  //  await updateRecord(stub.uuid, stub.trunk, {});
  //  expect(updateEntry).toHaveBeenCalledWith(stub.uuid, {});
  //  expect(saveRepoRecord).not.toHaveBeenCalled();
  //});
});

describe("changeRepo", () => {
  // test("", () => {
  // expect(searchParamsFromURL("_=a&a=1").toString()).toEqual(
  // "_=a&a=1&.sortBy=a",
  // );
  // });
  //  test("root", async () => {
  //    const testCase = stub.cases.tags;
  //
  //    const result = await repoFromURL("a=b", "/");
  //
  //    expect(result).toEqual({
  //      repo: { _: "repo", repo: "root" },
  //      schema: schemaRoot,
  //    });
  //  });
  //
  //  test("clone", async () => {
  //    const testCase = stub.cases.tags;
  //
  //    cloneAndOpen.mockImplementation(() => ({}));
  //
  //    findAndOpen.mockImplementation(() => undefined);
  //
  //    const result = await repoFromURL(
  //      `~=${testCase.url}&-=${testCase.token}`,
  //      "/",
  //    );
  //
  //    expect(cloneAndOpen).toHaveBeenCalledWith(testCase.url, testCase.token);
  //
  //    expect(result).toEqual({});
  //  });
  //
  //  test("clone error returns root", async () => {
  //    const testCase = stub.cases.tags;
  //
  //    cloneAndOpen.mockImplementation(() => {
  //      throw Error("");
  //    });
  //
  //    findAndOpen.mockImplementation(() => ({}));
  //
  //    const result = await repoFromURL(
  //      `~=${testCase.url}&-=${testCase.token}`,
  //      "/",
  //    );
  //
  //    expect(cloneAndOpen).toHaveBeenCalledWith(testCase.url, testCase.token);
  //
  //    expect(result).toEqual({
  //      repo: { _: "repo", repo: "root" },
  //      schema: schemaRoot,
  //    });
  //  });
  //
  //  test("find", async () => {
  //    const testCase = stub.cases.tags;
  //
  //    cloneAndOpen.mockImplementation(() => undefined);
  //
  //    findAndOpen.mockImplementation(() => ({}));
  //
  //    const result = await repoFromURL("", `/${stub.reponame}`);
  //
  //    expect(findAndOpen).toHaveBeenCalledWith(stub.reponame);
  //
  //    expect(result).toEqual({});
  //  });
  //
  //  test("find error", async () => {
  //    const testCase = stub.cases.tags;
  //
  //    cloneAndOpen.mockImplementation(() => undefined);
  //
  //    findAndOpen.mockImplementation(() => {
  //      throw Error("");
  //    });
  //
  //    const result = await repoFromURL("", `/${stub.reponame}`);
  //
  //    expect(findAndOpen).toHaveBeenCalledWith(stub.reponame);
  //
  //    expect(result).toEqual({
  //      repo: { _: "repo", repo: "root" },
  //      schema: schemaRoot,
  //    });
  //  });
});
