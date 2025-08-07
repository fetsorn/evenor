import { describe, expect, test, vi } from "vitest";
import api from "@/api/index.js";
import { readSchema, createRoot } from "@/store/record.js";
import { enrichBranchRecords, schemaToBranchRecords } from "@/store/pure.js";
import { find, clone } from "@/store/open.js";
import schemaRoot from "@/store/default_root_schema.json";
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
    createRoot: vi.fn(),
  };
});

describe("find", () => {
  test("throws on error", async () => {
    api.select.mockImplementation(async () => {
      throw Error("error");
    });

    await expect(() => find(undefined, stub.name)).rejects.toThrowError();
  });

  test("finds the root", async () => {
    const result = await find("root", undefined);

    expect(result).toStrictEqual({
      schema: schemaRoot,
      mind: { _: "mind", mind: "root", name: "minds" },
    });
  });

  test("finds a mind", async () => {
    const testCase = stub.cases.tags;

    api.select.mockImplementation(() => [testCase.record]);

    readSchema.mockImplementation(() => stub.schema);

    const result = await find(stub.id, undefined);

    expect(api.select).toHaveBeenCalledWith("root", {
      _: "mind",
      mind: stub.id,
    });

    expect(result).toStrictEqual({
      schema: stub.schema,
      mind: testCase.record,
    });
  });
});

describe("clone", () => {
  test("throws on error", async () => {
    const testCase = stub.cases.tags;

    crypto.subtle.digest = vi.fn(() => {
      throw Error("");
    });

    await expect(() =>
      clone(undefined, undefined, testCase.url, testCase.token),
    ).rejects.toThrowError();
  });

  test("clones a mind", async () => {
    const testCase = stub.cases.tags;

    crypto.subtle.digest = vi.fn(() => stub.id);

    readSchema.mockImplementation(() => testCase.schema);

    schemaToBranchRecords.mockImplementation(() => [
      testCase.schemaRecord,
      testCase.metaRecords,
    ]);

    enrichBranchRecords.mockImplementation(() => testCase.branchRecords);

    const result = await clone(
      undefined,
      undefined,
      testCase.url,
      testCase.token,
    );

    expect(createRoot).toHaveBeenCalled();

    expect(api.clone).toHaveBeenCalledWith(stub.id, undefined, {
      url: testCase.url,
      token: testCase.token,
    });

    expect(readSchema).toHaveBeenCalledWith(stub.id);

    const c = {
      _: "mind",
      branch: [
        {
          _: "branch",
          branch: "branch1",
          leaf: ["branch2"],
          trunk: [],
        },
        {
          _: "branch",
          branch: "branch2",
          leaf: [],
          task: "date",
          trunk: ["branch1"],
        },
      ],
      origin_url: {
        _: "origin_url",
        origin_url: "https://example.com/name",
        origin_token: "token",
      },
      mind: "id",
      name: "name",
    };

    expect(result).toStrictEqual({ schema: testCase.schema, mind: c });
  });
});
