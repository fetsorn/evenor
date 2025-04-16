import { describe, expect, test, vi } from "vitest";
import { sha256 } from "js-sha256";
import {
  newUUID,
  cloneAndOpen,
  findAndOpen,
  readRemote,
  readLocals,
  writeRemotes,
  writeLocals,
  readSchema,
  loadRepoRecord,
  createRoot,
  saveRepoRecord,
  findRecord,
  saveRecord,
  editRecord,
  wipeRecord,
  changeRepo,
  repoFromURL,
} from "./action.js";

describe("newUUID", () => {
  vi.mock("js-sha256", async (importOriginal) => {
    const mod = await importOriginal();

    return {
      ...mod,
      sha256: vi.fn(() => 1),
    };
  });

  test("generates a uuid", () => {
    const uuid = newUUID();

    expect(sha256).toHaveBeenCalled();

    expect(uuid).toBe(1);
  });
});

//test("cloneAndOpen", () => {
//  expect(false).toBe(true);
//});
//
//test("findAndOpen", () => {
//  expect(false).toBe(true);
//});
//
//test("readRemotes", () => {
//  expect(false).toBe(true);
//});
//
//test("readLocals", () => {
//  expect(false).toBe(true);
//});
//
//test("writeRemotes", () => {
//  expect(false).toBe(true);
//});
//
//test("writeLocals", () => {
//  expect(false).toBe(true);
//});
//
//test("readSchema", () => {
//  expect(false).toBe(true);
//});
//
//test("repoFromURL", () => {
//  expect(false).toBe(true);
//});
//
//test("changeRepo", () => {
//  expect(false).toBe(true);
//});
//
//test("createRoot", () => {
//  expect(false).toBe(true);
//});
//
//test("setURL", () => {
//  expect(false).toBe(true);
//});
//
//test("loadRepoRecord", () => {
//  expect(false).toBe(true);
//});
//
//test("saveRepoRecord", () => {
//  expect(false).toBe(true);
//});
