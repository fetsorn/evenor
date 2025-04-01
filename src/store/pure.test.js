import { expect, test } from "vitest";
import { isTwig } from "./pure.js";

test("isTwig", () => {
  expect(isTwig({ a: { trunks: [], leaves: [] } }, "a")).toBe(true);
});

test("schemaToBranchRecords", () => {
  expect(false).toBe(true);
});

test("getDefaultSortBy", () => {
  expect(false).toBe(true);
});

test("queriesToParams", () => {
  expect(false).toBe(true);
});

test("searchParamsToQuery", () => {
  expect(false).toBe(true);
});

test("enrichBranchRecords", () => {
  expect(false).toBe(true);
});

test("extractSchemaRecords", () => {
  expect(false).toBe(true);
});

test("recordsToSchema", () => {
  expect(false).toBe(true);
});
