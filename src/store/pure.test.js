import { describe, expect, test } from "vitest";
import {
  isTwig,
  queriesToParams,
  searchParamsToQueries,
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

describe("queriesToParams", () => {
  test("throws when no base", () => {
    const testCase = stub.cases.noBase;

    expect(() => queriesToParams(stub.queries)).toThrowError();
  });

  test("query base value", () => {
    const testCase = stub.cases.baseValue;

    expect(queriesToParams(testCase.queries)).toEqual(testCase.searchParams);
  });

  test("query leaf value", () => {
    const testCase = stub.cases.leafValue;

    expect(queriesToParams(testCase.queries)).toEqual(testCase.searchParams);
  });

  test("query twig out of order", () => {
    const testCase = stub.cases.twigOutOfOrder;

    expect(queriesToParams(testCase.queries)).toEqual(testCase.searchParams);
  });
});

describe("searchParamsToQueries", () => {
  test("throws when no base", () => {
    const testCase = stub.cases.noBase;

    expect(() =>
      searchParamsToQueries(stub.schema, testCase.searchParams),
    ).toThrowError();
  });

  test("query base value", () => {
    const testCase = stub.cases.baseValue;

    expect(searchParamsToQueries(stub.schema, testCase.searchParams)).toEqual(
      testCase.queries,
    );
  });

  test("query leaf value", () => {
    const testCase = stub.cases.leafValue;

    expect(searchParamsToQueries(stub.schema, testCase.searchParams)).toEqual(
      testCase.queries,
    );
  });

  test("query leaf value", () => {
    const testCase = stub.cases.twigOutOfOrder;

    expect(searchParamsToQueries(stub.schema, testCase.searchParams)).toEqual(
      testCase.queries,
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
