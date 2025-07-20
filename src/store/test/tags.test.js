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
      getOrigin: vi.fn(),
      setOrigin: vi.fn(),
      getAssetPath: vi.fn(),
      setAssetPath: vi.fn(),
    },
  };
});

describe("readRemoteTags", () => {
  test("", async () => {
    const testCase = stub.cases.tags;

    api.getOrigin.mockImplementation(() => ({
      url: testCase.url,
      token: testCase.token,
    }));

    const remoteTags = await readRemoteTags(stub.uuid);

    expect(api.getOrigin).toHaveBeenCalledWith(stub.uuid);

    expect(remoteTags).toStrictEqual([testCase.originUrl]);
  });
});

describe("readLocalTags", () => {
  test("", async () => {
    const testCase = stub.cases.tags;

    api.getAssetPath.mockImplementation(() => testCase.assetPath);

    const localTags = await readLocalTags(stub.uuid);

    expect(api.getAssetPath).toHaveBeenCalledWith(stub.uuid);

    expect(localTags).toStrictEqual([testCase.localTag]);
  });
});

describe("writeRemoteTags", () => {
  test("", async () => {
    const testCase = stub.cases.tags;

    await writeRemoteTags(stub.uuid, [testCase.originUrl]);

    expect(api.setOrigin).toHaveBeenCalledWith(
      stub.uuid,
      testCase.url,
      testCase.token,
    );
  });
});

describe("writeLocalTags", () => {
  test("", async () => {
    const testCase = stub.cases.tags;

    await writeLocalTags(stub.uuid, [testCase.localTag]);

    expect(api.setAssetPath).toHaveBeenCalledWith(
      stub.uuid,
      testCase.assetPath,
    );
  });
});
