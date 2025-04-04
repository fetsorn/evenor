import { expect, test, describe, beforeAll } from "vitest";
import { page, userEvent } from "@vitest/browser/context";
import browser from "./index.js";

const uuid = "a";

describe("createRepo", () => {
  beforeAll(async () => {
    // await browser.createRepo(uuid, "b");
  });

  test("creates a directory", async () => {
    expect(false).toBe(true);
  });

  test("renames a directory", async () => {
    expect(false).toBe(true);
  });

  test("writes .gitignore", async () => {
    expect(false).toBe(true);
  });

  test("writes .csvs.csv", async () => {
    expect(false).toBe(true);
  });
});

describe("clone", () => {
  test("fetches", async () => {
    expect(false).toBe(true);
  });

  test("writes remote", async () => {
    expect(false).toBe(true);
  });
});

describe("commit", () => {
  test("adds", async () => {
    expect(false).toBe(true);
  });

  test("creates message", async () => {
    expect(false).toBe(true);
  });

  test("smudges lfs", async () => {
    expect(false).toBe(true);
  });
});

test("push", async () => {
  // write test dataset
  // push
  // check remote git server
  expect(false).toBe(true);
});

test("pull", async () => {
  // write test dataset
  // pull
  // check git log
  expect(false).toBe(true);
});

test("listRemotes", async () => {
  // write test dataset
  // list remotes
  // check remotes
  expect(false).toBe(true);
});

test("addRemote", async () => {
  // write test dataset
  // add remote
  // check remotes
  expect(false).toBe(true);
});

test("getRemote", async () => {
  // write test dataset
  // get remote
  // check remote
  expect(false).toBe(true);
});
