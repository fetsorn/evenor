import { describe, expect, test, vi } from "vitest";
import {
  readRemotes,
  readAssetPaths,
  writeRemotes,
  writeAssetPaths,
} from "./bar.js";
import api from "../api/index.js";
import stub from "./stub.js";

vi.mock("../api/index.js", async (importOriginal) => {
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

describe("readRemotes", () => {
  test("", async () => {
    api.listRemotes.mockImplementation(() => ["remote"]);

    api.getRemote.mockImplementation(() => ["url", "token"]);

    const remotes = await readRemotes(stub.uuid);

    expect(api.listRemotes).toHaveBeenCalledWith(stub.uuid);

    expect(api.getRemote).toHaveBeenCalledWith(stub.uuid, "remote");

    expect(remotes).toEqual([
      {
        _: "remote_tag",
        remote_name: "remote",
        remote_url: "url",
        remote_token: "token",
      },
    ]);
  });
});
