import { describe, expect, test, vi } from "vitest";
import {
  readRemoteTags,
  readLocalTags,
  writeRemoteTags,
  writeLocalTags,
} from "@/proxy/tags.js";
import stub from "./stub.js";

describe("readRemoteTags", () => {
  test("", async () => {
    const testCase = stub.cases.tags;

    const api = {
      getOrigin: vi.fn(() => ({
        url: testCase.url,
        token: testCase.token,
      })),
    };

    const remoteTags = await readRemoteTags(api, stub.id);

    expect(api.getOrigin).toHaveBeenCalledWith(stub.id);

    expect(remoteTags).toStrictEqual([testCase.originUrl]);
  });
});

describe("readLocalTags", () => {
  test("", async () => {
    const testCase = stub.cases.tags;

    const api = {
      getAssetPath: vi.fn(() => testCase.assetPath),
    };

    const localTags = await readLocalTags(api, stub.id);

    expect(api.getAssetPath).toHaveBeenCalledWith(stub.id);

    expect(localTags).toStrictEqual([testCase.localTag]);
  });
});

describe("writeRemoteTags", () => {
  test("", async () => {
    const testCase = stub.cases.tags;

    const api = {
      setOrigin: vi.fn(),
    };

    await writeRemoteTags(api, stub.id, [testCase.originUrl]);

    expect(api.setOrigin).toHaveBeenCalledWith(stub.id, {
      url: testCase.url,
      token: testCase.token,
    });
  });
});

describe("writeLocalTags", () => {
  test("", async () => {
    const testCase = stub.cases.tags;

    const api = {
      setAssetPath: vi.fn(),
    };

    await writeLocalTags(api, stub.id, [testCase.localTag]);

    expect(api.setAssetPath).toHaveBeenCalledWith(stub.id, testCase.assetPath);
  });
});
