import { describe, expect, test, vi } from "vitest";
import { sha256 } from "js-sha256";
import { newUUID, updateRepo, updateEntry, deleteRecord } from "./foo.js";

vi.mock("../api/index.js", async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    default: {
      deleteRecord: vi.fn(),
      updateRecord: vi.fn(),
      select: vi.fn(),
      commit: vi.fn(),
    },
  };
});

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

describe("deleteRecord", () => {
  test("", async () => {
    await deleteRecord("repo", {});

    expect(api.deleteRecord).toHaveBeenCalledWith("repo", {});

    expect(api.commit).toHaveBeenCalledWith("repo");
  });
});

describe("updateRepo", () => {
  test("", async () => {
    await updateRepo("repo", {});

    expect(api.updateRecord).toHaveBeenCalledWith("repo", {});

    expect(api.commit).toHaveBeenCalledWith("repo");
  });
});

describe("updateRepo", () => {
  test("", async () => {
    await updateEntry("repo", {});

    expect(api.updateRecord).toHaveBeenCalledWith("repo", {});

    expect(api.commit).toHaveBeenCalledWith("repo");
  });
});
