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

//test("enrichBranchRecords", () => {
//  expect(false).toBe(true);
//});
//
//test("extractSchemaRecords", () => {
//  expect(false).toBe(true);
//});
//
//test("recordsToSchema", () => {
//  expect(false).toBe(true);
//});
//
//test("schemaToBranchRecords", () => {
//  expect(false).toBe(true);
//});
