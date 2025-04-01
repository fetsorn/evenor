import { expect, test, describe, beforeAll } from "vitest";
import { page, userEvent } from "@vitest/browser/context";
import browser from "./browser.js";
import { Buffer } from "buffer";
window.Buffer = window.Buffer || Buffer;

const uuid = "a";

describe("ensure", () => {
  beforeAll(async () => {
    await browser.ensure(uuid, "b");
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

  test("writes .gitattributes", async () => {
    expect(false).toBe(true);
  });

  test("creates .git directory", async () => {
    expect(false).toBe(true);
  });

  test("sets git config", async () => {
    expect(false).toBe(true);
  });

  test("writes .csvs.csv", async () => {
    expect(false).toBe(true);
  });

  test("commits", async () => {
    expect(false).toBe(true);
  });
});

test("dir", async () => {
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

test("putAsset", async () => {
  // assign stub contents
  // put
  // check contents at asset path
  expect(false).toBe(true);
});

test("uploadFile", async () => {
  // assign stub contents
  // write stub file
  // TODO choose a file in the upload dialog
  // https://vitest.dev/guide/browser/context.html#page
  await page.getByRole().fill();
  // upload programmatically instead of clicking in the picker
  // userEvent.upload(input, files);
  // check contents
  expect(false).toBe(true);
});

test("select", async () => {
  // write test dataset
  // select
  // check return value
  expect(false).toBe(true);
});

test("selectStream", async () => {
  // write test dataset
  // consume select stream
  // check return value
  expect(false).toBe(true);
});

test("updateRecord", async () => {
  // write test dataset
  // assign stub record
  // update
  // check dataset contents
  expect(false).toBe(true);
});

test("deleteRecord", async () => {
  // write test dataset
  // assign stub record
  // delete
  // check dataset contents
  expect(false).toBe(true);
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

test("uploadBlobsLFS", async () => {
  // check remote lfs server
  expect(false).toBe(true);
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

test("downloadAsset", async () => {
  // write test dataset
  // prepare to test file-saver
  // downloadAsset
  // choose path with page
  // check contents
  expect(false).toBe(true);
});

test("zip", async () => {
  // write test dataset
  // prepare to test file-saver
  // zip
  // choose path with page
  // check contents
  expect(false).toBe(true);
});

test("fetchAsset", async () => {
  // write test dataset
  // fetchAsset
  // check Uint8Array contents
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

test("addAssetPath", async () => {
  // write test dataset
  // add asset path
  // check asset path
  expect(false).toBe(true);
});

test("listAssetPaths", async () => {
  // write test dataset
  // list asset paths
  // check paths
  expect(false).toBe(true);
});

test("downloadUrlFromPointer", async () => {
  // start test lfs server
  // assign test pointer
  // NOTE: look at tests or setup in fetsorn/isogit-lfs
  // download url from pointer
  // check url
  expect(false).toBe(true);
});
