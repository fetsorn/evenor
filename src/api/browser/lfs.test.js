import { expect, test, describe, beforeAll } from "vitest";
import { page, userEvent } from "@vitest/browser/context";
import browser from "./index.js";

describe("createLFS", () => {
  beforeAll(async () => {
    // await browser.createLFS(uuid, "b");
  });

  test("writes .gitattributes", async () => {
    expect(false).toBe(true);
  });

  test("sets git config", async () => {
    expect(false).toBe(true);
  });
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

test("uploadBlobsLFS", async () => {
  // check remote lfs server
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

test("fetchAsset", async () => {
  // write test dataset
  // fetchAsset
  // check Uint8Array contents
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
