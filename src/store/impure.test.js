import { describe, expect, test, vi } from "vitest";
import { sha256 } from "js-sha256";
import api from "../api/index.js";
import {
  newUUID,
  readSchema,
  cloneAndOpen,
  findAndOpen,
  repoFromURL,
  readRemotes,
  readLocals,
  loadRepoRecord,
  createRoot,
  writeRemotes,
  writeLocals,
  saveRepoRecord,
  findRecord,
} from "./impure.js";

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

describe("readSchema", () => {
  vi.mock("../api/index.js", async (importOriginal) => {
    const mod = await importOriginal();

    return {
      ...mod,
      default: {
        select: vi.fn(),
      },
    };
  });

  test("root", () => {
    const schema = readSchema("root");

    expect(uuid).toBe(1);
  });

  test("", () => {
    const schema = readSchema(stub.uuid);

    expect(uuid).toBe(1);
  });
});
