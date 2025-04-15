import { describe, expect, test } from "vitest";
import {
  isTwig,
  ensureTrunk,
  queryToQueryString,
  queryStringToQuery,
  enrichBranchRecords,
  extractSchemaRecords,
  schemaToBranchRecords,
  recordsToSchema,
  changeQueries,
  makeURL,
  queriesFromURL,
} from "./pure.js";
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

describe("queryToQueryString", () => {
  test("throws when no base", () => {
    const testCase = stub.cases.noBase;

    expect(() => queryToQueryString(stub.queryObject)).toThrowError();
  });

  test("query base value", () => {
    const testCase = stub.cases.baseValue;

    expect(queryToQueryString(testCase.queryObject)).toEqual(
      testCase.queryString,
    );
  });

  test("query leaf value", () => {
    const testCase = stub.cases.leafValue;

    expect(queryToQueryString(testCase.queryObject)).toEqual(
      testCase.queryString,
    );
  });

  test("query nested value", () => {
    const testCase = stub.cases.nestedValue;

    expect(queryToQueryString(testCase.queryObject)).toEqual(
      testCase.queryString,
    );
  });

  test("query twig out of order", () => {
    const testCase = stub.cases.twigOutOfOrder;

    expect(queryToQueryString(testCase.queryObject)).not.toEqual(
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

describe("queryStringToQuery", () => {
  test("throws when no base", () => {
    const testCase = stub.cases.noBase;

    expect(() =>
      queryStringToQuery(stub.schema, testCase.queryString),
    ).toThrowError();
  });

  test("query base value", () => {
    const testCase = stub.cases.baseValue;

    expect(queryStringToQuery(stub.schema, testCase.queryString)).toEqual(
      testCase.queryObject,
    );
  });

  test("query leaf value", () => {
    const testCase = stub.cases.leafValue;

    expect(queryStringToQuery(stub.schema, testCase.queryString)).toEqual(
      testCase.queryObject,
    );
  });

  test("query nested value", () => {
    const testCase = stub.cases.nestedValue;

    expect(queryStringToQuery(stub.schema, testCase.queryString)).toEqual(
      testCase.queryObject,
    );
  });

  test("query twig out of order", () => {
    const testCase = stub.cases.twigOutOfOrder;

    expect(queryStringToQuery(stub.schema, testCase.queryString)).toEqual(
      testCase.queryObject,
    );
  });
});

describe("enrichBranchRecords", () => {
  test("enriches", () => {
    const schemaRecord = { _: "_", branch1: ["branch2"] };

    const metaRecords = [
      { _: "branch", branch: "branch1" },
      { _: "branch", branch: "branch2", task: "date" },
    ];

    const branchRecords = [
      { _: "branch", branch: "branch1", trunks: [], leaves: ["branch2"] },
      {
        _: "branch",
        branch: "branch2",
        trunks: ["branch1"],
        leaves: [],
        task: "date",
      },
    ];

    expect(enrichBranchRecords(schemaRecord, metaRecords)).toEqual(
      branchRecords,
    );
  });
});

describe("extractSchemaRecords", () => {
  test("extracts", () => {
    const schemaRecord = { _: "_", branch1: ["branch2"] };

    const metaRecords = [
      { _: "branch", branch: "branch2", task: "date" },
      { _: "branch", branch: "branch1" },
    ];

    const branchRecords = [
      { _: "branch", branch: "branch1", trunks: [], leaves: ["branch2"] },
      {
        _: "branch",
        branch: "branch2",
        trunks: ["branch1"],
        leaves: [],
        task: "date",
      },
    ];

    expect(extractSchemaRecords(branchRecords)).toEqual([
      schemaRecord,
      ...metaRecords,
    ]);
  });
});

describe("schemaToBranchRecords", () => {
  test("converts", () => {
    const schema = {
      event: { trunks: [], leaves: ["datum"], description: { en: "", ru: "" } },
      datum: { trunks: ["event"], leaves: [] },
    };

    const schemaRecord = { _: "_", event: ["datum"] };

    const metaRecords = [
      { _: "branch", branch: "event", description_en: "", description_ru: "" },
      { _: "branch", branch: "datum" },
    ];

    expect(schemaToBranchRecords(schema)).toEqual([
      schemaRecord,
      ...metaRecords,
    ]);
  });
});

describe("recordsToSchema", () => {
  test("converts", () => {
    const schema = {
      event: { trunks: [], leaves: ["datum"], description: { en: "", ru: "" } },
      datum: { trunks: ["event"], leaves: [] },
    };

    const schemaRecord = { _: "_", event: ["datum"] };

    const metaRecords = [
      { _: "branch", branch: "event", description_en: "", description_ru: "" },
      { _: "branch", branch: "datum" },
    ];

    expect(recordsToSchema(schemaRecord, metaRecords)).toEqual(schema);
  });
});

describe("changeQueries", () => {
  test("", () => {
    expect(changeQueries(stub.schema, { _: "a", a: 1 }, "b", 2)).toEqual({
      _: "a",
      a: 1,
      b: 2,
    });
  });
});

describe("makeURL", () => {
  test("", () => {
    expect(
      makeURL(
        {
          _: "a",
          a: 1,
          b: 2,
        },
        "a",
        undefined,
        "root",
        "name",
      ),
    ).toEqual("#?_=a&a=1&b=2");
  });

  test("", () => {
    expect(
      makeURL(
        {
          _: "a",
          a: 1,
          b: 2,
        },
        "a",
        undefined,
        "uuid",
        "name",
      ),
    ).toEqual("#/name?_=a&a=1&b=2");
  });
});

// TODO should this return csvs nested query?
describe("queriesFromURL", () => {
  test("", () => {
    expect(queriesFromURL("_=a&a=1", "/uuid")).toEqual({
      _: "a",
      a: "1",
      ".sortBy": "a",
    });
  });
});
