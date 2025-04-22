import { describe, expect, test } from "vitest";
import {
  isTwig,
  ensureTrunk,
  queryToSearchParams,
  searchParamsToQuery,
  enrichBranchRecords,
  extractSchemaRecords,
  schemaToBranchRecords,
  recordsToSchema,
  changeSearchParams,
  makeURL,
} from "@/store/pure.js";
import stub from "./stub.js";

describe("isTwig", () => {
  test("finds trunk", () => {
    expect(isTwig(stub.schema, stub.trunk)).toBe(false);
  });

  test("finds twig", () => {
    expect(isTwig(stub.schema, stub.twig)).toBe(true);
  });

  test("throws on non-existing branch", () => {
    expect(() => isTwig(stub.schema, stub.nonExisting)).toThrowError();
  });
});

describe("queryToSearchParams", () => {
  test("throws when no base", () => {
    const testCase = stub.cases.noBase;

    expect(() => queryToSearchParams(stub.queryObject)).toThrowError();
  });

  test("query base value", () => {
    const testCase = stub.cases.baseValue;

    expect(queryToSearchParams(testCase.queryObject).toString()).toEqual(
      testCase.queryString,
    );
  });

  test("query leaf value", () => {
    const testCase = stub.cases.leafValue;

    expect(queryToSearchParams(testCase.queryObject).toString()).toEqual(
      testCase.queryString,
    );
  });

  test("query nested value", () => {
    const testCase = stub.cases.nestedValue;

    expect(queryToSearchParams(testCase.queryObject).toString()).toEqual(
      testCase.queryString,
    );
  });

  test("query twig out of order", () => {
    const testCase = stub.cases.twigOutOfOrder;

    expect(queryToSearchParams(testCase.queryObject).toString()).not.toEqual(
      testCase.queryString,
    );
  });
});

describe("ensureTrunk", () => {
  test("throws when no base", () => {
    const testCase = stub.cases.noBase;

    expect(() =>
      ensureTrunk(stub.schema, testCase.queryObject, stub.trunk, stub.leaf),
    ).toThrowError();
  });

  test("does nothing when has trunk", () => {
    const testCase = stub.cases.baseValue;

    expect(
      ensureTrunk(stub.schema, testCase.queryObject, stub.root, stub.trunk),
    ).toEqual(testCase.queryObject);
  });

  test("adds trunk", () => {
    const testCase = stub.cases.baseValue;

    expect(
      ensureTrunk(stub.schema, testCase.queryObject, stub.trunk, stub.twig),
    ).toEqual({ _: "a", a: "1", b: { _: "b" } });
  });
});

describe("searchParamsToQuery", () => {
  test("throws when no base", () => {
    const testCase = stub.cases.noBase;

    expect(() =>
      searchParamsToQuery(
        stub.schema,
        new URLSearchParams(testCase.queryString),
      ),
    ).toThrowError();
  });

  test("query base value", () => {
    const testCase = stub.cases.baseValue;

    expect(
      searchParamsToQuery(
        stub.schema,
        new URLSearchParams(testCase.queryString),
      ),
    ).toEqual(testCase.queryObject);
  });

  test("query leaf value", () => {
    const testCase = stub.cases.leafValue;

    expect(
      searchParamsToQuery(
        stub.schema,
        new URLSearchParams(testCase.queryString),
      ),
    ).toEqual(testCase.queryObject);
  });

  test("query nested value", () => {
    const testCase = stub.cases.nestedValue;

    expect(
      searchParamsToQuery(
        stub.schema,
        new URLSearchParams(testCase.queryString),
      ),
    ).toEqual(testCase.queryObject);
  });

  test("query twig out of order", () => {
    const testCase = stub.cases.twigOutOfOrder;

    expect(
      searchParamsToQuery(
        stub.schema,
        new URLSearchParams(testCase.queryString),
      ),
    ).toEqual(testCase.queryObject);
  });
});

describe("enrichBranchRecords", () => {
  test("enriches", () => {
    const testCase = stub.cases.trunk;

    expect(
      enrichBranchRecords(testCase.schemaRecord, testCase.metaRecords),
    ).toEqual(testCase.branchRecords);
  });
});

describe("extractSchemaRecords", () => {
  test("extracts", () => {
    const testCase = stub.cases.trunk;

    expect(extractSchemaRecords(testCase.branchRecords)).toEqual([
      testCase.schemaRecord,
      ...testCase.metaRecords,
    ]);
  });
});

describe("schemaToBranchRecords", () => {
  test("converts", () => {
    const testCase = stub.cases.description;

    expect(schemaToBranchRecords(testCase.schema)).toEqual([
      testCase.schemaRecord,
      ...testCase.metaRecords,
    ]);
  });
});

describe("recordsToSchema", () => {
  test("converts", () => {
    const testCase = stub.cases.description;

    expect(
      recordsToSchema(testCase.schemaRecord, testCase.metaRecords),
    ).toEqual(testCase.schema);
  });
});

describe("changeSearchParams", () => {
  test("ignores empty field", () => {
    expect(
      changeSearchParams(new URLSearchParams("_=a&a=1"), "", 2).toString(),
    ).toEqual("_=a&a=1");
  });

  test("erases params", () => {
    expect(
      changeSearchParams(
        new URLSearchParams("_=a&a=1"),
        undefined,
        undefined,
      ).toString(),
    ).toEqual("");
  });

  test("sets base and sortBy", () => {
    expect(
      changeSearchParams(new URLSearchParams("_=a&a=1"), "_", "b").toString(),
    ).toEqual("_=b&.sortBy=b");
  });

  test("deletes value", () => {
    expect(
      changeSearchParams(
        new URLSearchParams("_=a&a=1"),
        "a",
        undefined,
      ).toString(),
    ).toEqual("_=a");
  });

  test("sets value", () => {
    expect(
      changeSearchParams(new URLSearchParams("_=a&a=1"), "b", 2).toString(),
    ).toEqual("_=a&a=1&b=2");
  });
});

describe("makeURL", () => {
  test("sets root", () => {
    expect(
      makeURL(new URLSearchParams("_=a&a=1&b=2"), undefined, "root", "name"),
    ).toEqual("#?_=a&a=1&b=2");
  });

  test("sets repo", () => {
    expect(
      makeURL(new URLSearchParams("_=a&a=1&b=2"), undefined, "uuid", "name"),
    ).toEqual("#/name?_=a&a=1&b=2");
  });

  test("sets sortBy", () => {
    expect(
      makeURL(new URLSearchParams("_=a&a=1&b=2"), "b", "uuid", "name"),
    ).toEqual("#/name?_=a&a=1&b=2&.sortBy=b");
  });
});
