import { expect, test, describe, beforeAll } from "vitest";
import { page, userEvent } from "@vitest/browser/context";
import browser from "./index.js";

const uuid = "a";

test("findDir", async () => {
  // TODO replace with write test dataset
  await browser.ensure(uuid, "b");

  const dir = await browser.findDir(uuid);

  expect(dir).toBe("/a-b");
});

test("fetchFile", async () => {
  // assign stub contents
  // write a stub file
  // fetch
  // check buffer contents
  expect(false).toBe(true);
});

test("readFile", async () => {
  // assign stub contents
  // write a stub file
  // fetch
  // check decoded contents
  expect(false).toBe(true);
});

test("writeFile", async () => {
  // assign stub contents
  // write
  // check contents
  expect(false).toBe(true);
});

test("rimraf", async () => {
  // write test directory
  // rimraf
  // check that no directory
  expect(false).toBe(true);
});

test("ls", async () => {
  // write test directory
  // ls
  // NOTE: maybe ls should return a string
  // check that console logs paths
  expect(false).toBe(true);
});
