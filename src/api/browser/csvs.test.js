import { expect, test, describe, vi } from "vitest";
import csvs from "@fetsorn/csvs-js";
import { findDir } from "./io.js";
import { select, selectStream, updateRecord, deleteRecord } from "./csvs.js";

const mockDir = "path/to/dir";

const mockUUID = "a";

const mockQuery = { a: "b" };

const mockEntry = { c: "d" };

const mockOverview = [mockEntry];

vi.mock("./io.js", async (importOriginal) => {
  const mod = await importOriginal();

  const findDir = vi.fn(async (uuid) => {
    expect(uuid).toBe(mockUUID);

    return mockDir;
  });

  return {
    ...mod,
    findDir,
  };
});

vi.mock("@fetsorn/csvs-js", async (importOriginal) => {
  const mod = await importOriginal();

  const selectRecord = vi.fn(async ({ fs, dir, query }) => {
    expect(dir).toBe(mockDir);

    expect(query).toEqual(mockQuery);

    return mockOverview;
  });

  const selectRecordStream = vi.fn(
    ({ fs, dir }) =>
      new TransformStream({
        transform(query, controller) {
          expect(dir).toBe(mockDir);
          expect(query).toEqual(mockQuery);
          controller.enqueue(mockEntry);
        },
      }),
  );

  const updateRecord = vi.fn(({ fs, dir, query }) => {
    expect(dir).toBe(mockDir);

    expect(query).toEqual(mockEntry);
  });

  const deleteRecord = vi.fn(({ fs, dir, query }) => {
    expect(dir).toBe(mockDir);

    expect(query).toEqual(mockEntry);
  });

  return {
    ...mod,
    default: {
      ...mod,
      selectRecord,
      selectRecordStream,
      updateRecord,
      deleteRecord,
    },
  };
});

describe("csvs", () => {
  test("select", async () => {
    const overview = await select(mockUUID, mockQuery);

    expect(findDir).toHaveBeenCalled();

    expect(csvs.selectRecord).toHaveBeenCalled();

    expect(overview).toEqual(mockOverview);
  });

  test("selectStream", async () => {
    const { strm } = await selectStream(mockUUID, mockQuery);

    let overview = [];

    const outputStream = new WritableStream({
      write(entry) {
        overview.push(entry);
      },
    });

    await strm.pipeTo(outputStream);

    expect(findDir).toHaveBeenCalled();

    expect(csvs.selectRecordStream).toHaveBeenCalled();

    expect(overview).toEqual(mockOverview);
  });

  test("updateRecord", async () => {
    await updateRecord(mockUUID, mockEntry);

    expect(findDir).toHaveBeenCalled();

    expect(csvs.updateRecord).toHaveBeenCalled();
  });

  test("deleteRecord", async () => {
    await deleteRecord(mockUUID, mockEntry);

    expect(findDir).toHaveBeenCalled();

    expect(csvs.deleteRecord).toHaveBeenCalled();
  });
});
