import { describe, expect, beforeEach, test, vi } from "vitest";
import { changeMind } from "@/proxy/action.js";
import { readSchema } from "@/proxy/record.js";
import { find, clone } from "@/proxy/open.js";
import schemaRoot from "@/proxy/default_root_schema.json";
import stub from "./stub.js";

vi.mock("@/proxy/record.js", async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    readSchema: vi.fn(() => schemaRoot),
  };
});

vi.mock("@/proxy/pure.js", async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    makeURL: vi.fn(),
  };
});

vi.mock("@/proxy/open.js", async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    find: vi.fn(),
    clone: vi.fn(),
  };
});

describe("changeMind", () => {
  beforeEach(() => {
    find.mockReset();
  });

  // TODO pick default base and sortBy
  test("find root", async () => {
    find.mockImplementation(() => ({ mind: 1, schema: schemaRoot }));

    const api = {};

    const { mind, schema, searchParams } = await changeMind(api, "/", "_=mind");

    expect(find).toHaveBeenCalledWith(api, "root", undefined);

    expect(mind).toStrictEqual(1);

    expect(schema).toStrictEqual(schemaRoot);

    expect(searchParams.toString()).toStrictEqual(
      new URLSearchParams(`_=mind&.sortBy=mind`).toString(),
    );
  });

  test("find mind", async () => {
    find.mockImplementation(() => ({ mind: 1 }));
    readSchema.mockImplementation(() => stub.schema);

    const api = {};

    const { mind, schema, searchParams } = await changeMind(
      api,
      `/${stub.mind}`,
      "_=b",
    );

    expect(find).toHaveBeenCalledWith(api, stub.mind, undefined);

    expect(mind).toStrictEqual(1);

    expect(schema).toStrictEqual(stub.schema);

    expect(searchParams.toString()).toStrictEqual(
      new URLSearchParams(`_=b&.sortBy=b`).toString(),
    );
  });

  test("clone", async () => {
    const testCase = stub.cases.tags;

    clone.mockImplementation(() => ({ mind: 1 }));

    readSchema.mockImplementation(() => stub.schema);

    const api = { select: vi.fn(() => [testCase.record]) };

    const { mind, schema, searchParams } = await changeMind(
      api,
      "/",
      `~=${testCase.url}&-=${testCase.token}&_=b`,
    );

    expect(clone).toHaveBeenCalledWith(
      api,
      undefined,
      testCase.url,
      testCase.token,
    );

    expect(mind).toStrictEqual(1);

    expect(schema).toStrictEqual(stub.schema);

    expect(searchParams.toString()).toStrictEqual(
      new URLSearchParams(
        `~=${testCase.url}&-=${testCase.token}&_=b&.sortBy=b`,
      ).toString(),
    );
  });
});
