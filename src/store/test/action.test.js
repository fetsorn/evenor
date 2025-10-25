import { describe, expect, beforeEach, test, vi } from "vitest";
import { saveRecord, wipeRecord, changeMind } from "@/store/action.js";
import { createRoot, deleteRecord } from "@/store/record.js";
import { updateRecord } from "@/store/impure.js";
import { find, clone } from "@/store/open.js";
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
    const mind = {};

    const base = "b";

    const recordOld = { _: "b", b: "id1", c: "1" };

    const records = [recordOld];

    const recordNew = { _: "b", b: "id2", c: "2" };

    const recordsNew = await saveRecord(
      mind,
      base,
      records,
      recordOld,
      recordNew,
    );

    expect(createRoot).toHaveBeenCalled();

    expect(updateRecord).toHaveBeenCalledWith(mind, base, recordNew);

    expect(recordsNew).toStrictEqual([recordNew]);
  });
});

describe("wipeRecord", () => {
  test("deletes", async () => {
    const mind = {};

    const base = "b";

    const record = { _: "b", b: "id1", c: "1" };

    const records = [record];

    const recordsNew = await wipeRecord(mind, base, records, record);

    expect(deleteRecord).toHaveBeenCalledWith(mind, record);

    expect(recordsNew).toStrictEqual([]);
  });
});

describe("changeMind", () => {
  beforeEach(() => {
    find.mockReset();
  });

  // TODO pick default base and sortBy
  test("find root", async () => {
    find.mockImplementation(() => ({ mind: 1, schema: schemaRoot }));

    const { mind, schema, searchParams } = await changeMind("/", "_=mind");

    expect(find).toHaveBeenCalledWith("root", undefined);

    expect(mind).toStrictEqual(1);

    expect(schema).toStrictEqual(schemaRoot);

    expect(searchParams.toString()).toStrictEqual(
      new URLSearchParams(`_=mind&.sortBy=mind`).toString(),
    );
  });

  test("find mind", async () => {
    find.mockImplementation(() => ({ mind: 1, schema: stub.schema }));

    const { mind, schema, searchParams } = await changeMind(
      `/${stub.mind}`,
      "_=b",
    );

    expect(find).toHaveBeenCalledWith(stub.mind, undefined);

    expect(mind).toStrictEqual(1);

    expect(schema).toStrictEqual(stub.schema);

    expect(searchParams.toString()).toStrictEqual(
      new URLSearchParams(`_=b&.sortBy=b`).toString(),
    );
  });

  test("clone", async () => {
    const testCase = stub.cases.tags;

    clone.mockImplementation(() => ({ mind: 1, schema: stub.schema }));

    const { mind, schema, searchParams } = await changeMind(
      "/",
      `~=${testCase.url}&-=${testCase.token}&_=b`,
    );

    expect(clone).toHaveBeenCalledWith(testCase.url, testCase.token);

    expect(mind).toStrictEqual(1);

    expect(schema).toStrictEqual(stub.schema);

    expect(searchParams.toString()).toStrictEqual(
      new URLSearchParams(
        `~=${testCase.url}&-=${testCase.token}&_=b&.sortBy=b`,
      ).toString(),
    );
  });
});
