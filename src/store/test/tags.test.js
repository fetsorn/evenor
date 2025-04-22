import { describe, expect, test, vi } from "vitest";
import api from "@/api/index.js";
import {
  readRemoteTags,
  readLocalTags,
  writeRemoteTags,
  writeLocalTags,
} from "@/store/tags.js";
import stub from "./stub.js";

vi.mock("@/api/index.js", async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    default: {
      listRemotes: vi.fn(),
      getRemote: vi.fn(),
      listAssetPaths: vi.fn(),
      addRemote: vi.fn(),
      addAssetPath: vi.fn(),
    },
  };
});

describe("readRemoteTags", () => {
  test("", async () => {
    const testCase = stub.cases.tags;

    api.listRemotes.mockImplementation(() => [testCase.remote]);

    api.getRemote.mockImplementation(() => [testCase.url, testCase.token]);

    const remoteTags = await readRemoteTags(stub.uuid);

    expect(api.listRemotes).toHaveBeenCalledWith(stub.uuid);

    expect(api.getRemote).toHaveBeenCalledWith(stub.uuid, testCase.remote);

    expect(remoteTags).toEqual([testCase.remoteTag]);
  });
});

describe("readLocalTags", () => {
  test("", async () => {
    const testCase = stub.cases.tags;

    api.listAssetPaths.mockImplementation(() => [testCase.assetPath]);

    const localTags = await readLocalTags(stub.uuid);

    expect(api.listAssetPaths).toHaveBeenCalledWith(stub.uuid);

    expect(localTags).toEqual([testCase.localTag]);
  });
});

describe("writeRemoteTags", () => {
  test("", async () => {
    const testCase = stub.cases.tags;

    const locals = await writeRemoteTags(stub.uuid, [testCase.remoteTag]);

    expect(api.addRemote).toHaveBeenCalledWith(
      stub.uuid,
      testCase.remote,
      testCase.url,
      testCase.token,
    );
  });
});

describe("writeLocalTags", () => {
  test("", async () => {
    const testCase = stub.cases.tags;

    const locals = await writeLocalTags(stub.uuid, [testCase.localTag]);

    expect(api.addAssetPath).toHaveBeenCalledWith(
      stub.uuid,
      testCase.assetPath,
    );
  });
});
