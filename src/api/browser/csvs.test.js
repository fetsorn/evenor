import { expect, test, describe, beforeAll, vi } from "vitest";
import { page, userEvent } from "@vitest/browser/context";
import { selectRecord } from "@fetsorn/csvs-js";
import browser from "./index.js";

const datasetPath = "path/to/dir";

const mockUUID = "a";

const records = ["a"];

const mockQuery = { a: "b" };

test.only("select", async () => {
  vi.mock("./io.js", async (importOriginal) => {
    const mod = await importOriginal();

    return {
      ...mod,
      findDir: async (uuid) => {
        expect(uuid).toBe(mockUUID);

        return datasetPath;
      },
    };
  });

  vi.mock("@fetsorn/csvs-js", (importOriginal) => {
    const mod = importOriginal();

    return {
      ...mod,
      default: {
        ...mod,
        selectRecord: async ({ fs, dir, query }) => {
          expect(dir).toBe(datasetPath);

          expect(query).toEqual(mockQuery);

          return records;
        },
      },
    };
  });

  const out = await browser.select(mockUUID, mockQuery);

  expect(out).toEqual(records);
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
