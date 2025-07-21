import { expect, test, describe, beforeEach, afterEach, vi } from "vitest";
import { saveAs } from "file-saver";
import JsZip from "jszip";
import { fs } from "@/api/browser/lightningfs.js";
import { addToZip, zip } from "@/api/browser/zip.js";
import stub from "./stub.js";

vi.mock("file-saver", async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    saveAs: vi.fn(),
  };
});

describe("addToZip", () => {
  beforeEach(() => {
    fs.init("test", { wipe: true });
  });

  afterEach(async () => {
    // for lightning fs to release mutex on indexedDB
    await new Promise((resolve) => setTimeout(resolve, 500));
  });

  test("changes zipDir", async () => {
    // write test dataset
    await fs.promises.mkdir(stub.dirpath);

    await fs.promises.writeFile(stub.filepath, stub.content);

    const zipDir = new JsZip();

    await addToZip(stub.dirpath, zipDir);

    await expect(zipDir).toEqual(
      expect.objectContaining({
        files: { [stub.filename]: expect.objectContaining({}) },
      }),
    );
  });
});

describe("zip", () => {
  beforeEach(() => {
    fs.init("test", { wipe: true });
  });

  afterEach(async () => {
    // for lightning fs to release mutex on indexedDB
    await new Promise((resolve) => setTimeout(resolve, 500));
  });

  test("calls saveAs", async () => {
    // write test dataset
    await fs.promises.mkdir(stub.dirpath);

    await fs.promises.writeFile(stub.filepath, stub.content);

    await zip(stub.mind);

    await expect(saveAs).toHaveBeenCalledWith(new Blob(), "archive.zip");
  });
});
