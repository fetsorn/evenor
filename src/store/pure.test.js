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
  test("queriesToParams", () => {
    expect(queriesToParams(stub.queries)).toEqual(stub.searchParams);
  });
});

describe("searchParamsToQueries", () => {
  test("searchParamsToQueries", () => {
    expect(searchParamsToQueries(stub.schema, stub.searchParams)).toEqual(
      stub.queries,
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
