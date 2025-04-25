import { describe, expect, test, vi } from "vitest";
import { saveRecord, wipeRecord, changeRepo, search } from "@/store/action.js";
import { createRoot, deleteRecord } from "@/store/record.js";
import { updateRecord, selectStream } from "@/store/impure.js";
import { find, clone } from "@/store/open.js";
import { changeSearchParams, makeURL } from "@/store/pure.js";
import schemaRoot from "@/store/default_root_schema.json";
import stub from "./stub.js";

vi.mock("@/store/pure.js", async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    changeSearchParams: vi.fn(),
    makeURL: vi.fn(),
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
    createRoot: vi.fn(),
    deleteRecord: vi.fn(),
  };
});

vi.mock("@/store/impure.js", async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    updateRecord: vi.fn(),
    selectStream: vi.fn(),
  };
});

describe("saveRecord", () => {
  test("", async () => {
    const repo = {};

    const base = "b";

    const recordOld = { _: "b", b: "uuid1", c: "1" };

    const records = [recordOld];

    const recordNew = { _: "b", b: "uuid2", c: "2" };

    const recordsNew = await saveRecord(
      repo,
      base,
      records,
      recordOld,
      recordNew,
    );

    expect(createRoot).toHaveBeenCalled();

    expect(updateRecord).toHaveBeenCalledWith(repo, base, recordNew);

    expect(recordsNew).toStrictEqual([recordNew]);
  });
});

describe("wipeRecord", () => {
  test("deletes", async () => {
    const repo = {};

    const base = "b";

    const record = { _: "b", b: "uuid1", c: "1" };

    const records = [record];

    const recordsNew = await wipeRecord(repo, base, records, record);

    expect(deleteRecord).toHaveBeenCalledWith(repo, record);

    expect(recordsNew).toStrictEqual([]);
  });
});

describe("changeRepo", () => {
  // TODO pick default base and sortBy
  test("find root", async () => {
    find.mockImplementation(() => ({ repo: 1, schema: schemaRoot }));

    const { repo, schema, searchParams } = await changeRepo("/", "_=repo");

    expect(find).toHaveBeenCalledWith("root");

    expect(repo).toStrictEqual(1);

    expect(schema).toStrictEqual(schemaRoot);

    expect(searchParams.toString()).toStrictEqual(
      new URLSearchParams(`_=repo&.sortBy=repo`).toString(),
    );
  });

  test("find repo", async () => {
    find.mockImplementation(() => ({ repo: 1, schema: stub.schema }));

    const { repo, schema, searchParams } = await changeRepo(
      `/${stub.reponame}`,
      "_=b",
    );

    expect(find).toHaveBeenCalledWith(stub.reponame);

    expect(repo).toStrictEqual(1);

    expect(schema).toStrictEqual(stub.schema);

    expect(searchParams.toString()).toStrictEqual(
      new URLSearchParams(`_=b&.sortBy=b`).toString(),
    );
  });

  test("clone", async () => {
    const testCase = stub.cases.tags;

    clone.mockImplementation(() => ({ repo: 1, schema: stub.schema }));

    const { repo, schema, searchParams } = await changeRepo(
      "/",
      `~=${testCase.url}&-=${testCase.token}&_=b`,
    );

    expect(clone).toHaveBeenCalledWith(testCase.url, testCase.token);

    expect(repo).toStrictEqual(1);

    expect(schema).toStrictEqual(stub.schema);

    expect(searchParams.toString()).toStrictEqual(
      new URLSearchParams(
        `~=${testCase.url}&-=${testCase.token}&_=b&.sortBy=b`,
      ).toString(),
    );
  });
});

describe("search", () => {
  test("calls search", async () => {
    changeSearchParams.mockImplementation(() => 1);

    makeURL.mockImplementation(() => 2);

    window.history.replaceState = vi.fn();

    selectStream.mockImplementation(() => ({
      abortPreviousStream: 3,
      startStream: 4,
    }));

    const schema = stub.schema;
    const searchParamsOld = new URLSearchParams();
    const repo = {};
    const field = "a";
    const value = "b";
    const appendRecord = {};

    const { searchParams, abortPreviousStream, startStream } = await search(
      schema,
      searchParamsOld,
      repo,
      stub.reponame,
      field,
      value,
      appendRecord,
    );

    expect(changeSearchParams).toHaveBeenCalledWith(
      searchParamsOld,
      field,
      value,
    );

    expect(window.history.replaceState).toHaveBeenCalledWith(null, null, 2);

    expect(selectStream).toHaveBeenCalledWith(schema, repo, appendRecord, 1);

    expect(searchParams).toBe(1);

    expect(abortPreviousStream).toBe(3);

    expect(startStream).toBe(4);
  });

  test("ignores evenor specific param", async () => {
    changeSearchParams.mockImplementation(() => 1);

    makeURL.mockImplementation(() => 2);

    window.history.replaceState = vi.fn();

    const schema = stub.schema;
    const searchParamsOld = new URLSearchParams();
    const repo = {};
    const field = ".a";
    const value = "b";
    const appendRecord = {};

    selectStream.mockReset();

    const { searchParams, abortPreviousStream, startStream } = await search(
      schema,
      searchParamsOld,
      repo,
      stub.reponame,
      field,
      value,
      appendRecord,
    );

    expect(selectStream).not.toHaveBeenCalled();

    expect(searchParams).toBe(1);

    expect(abortPreviousStream).toBeTypeOf("function");

    expect(startStream).toBeTypeOf("function");
  });
});
