import { expect, test, describe, beforeEach, vi } from "vitest";
import { page, userEvent } from "@vitest/browser/context";
import git from "isomorphic-git";
import { fs } from "./lightningfs.js";
import browser from "./index.js";
import {
  createRepo,
  commit,
  clone,
  pull,
  push,
  listRemotes,
  addRemote,
  getRemote,
} from "./git.js";
import stub from "./stub.js";

vi.mock("isomorphic-git", async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    default: {
      ...mod,
      init: vi.fn(),
      clone: vi.fn(),
      statusMatrix: vi.fn(),
      resetIndex: vi.fn(),
      remove: vi.fn(),
      add: vi.fn(),
      commit: vi.fn(),
      setConfig: vi.fn(),
      fastForward: vi.fn(),
      push: vi.fn(),
      listRemotes: vi.fn(),
      addRemote: vi.fn(),
      getConfig: vi.fn(),
    },
  };
});

describe("createRepo", () => {
  beforeEach(() => {
    fs.init("test", { wipe: true });
  });

  test("creates a directory", async () => {
    await createRepo(stub.uuid, stub.name);

    const listing = await fs.promises.readdir("/");

    expect(listing).toEqual([stub.dir]);

    const gitignore = await fs.promises.readFile(
      `/${stub.dir}/.gitignore`,
      "utf8",
    );

    expect(gitignore).toBe(".DS_Store");

    const dotcsvs = await fs.promises.readFile(
      `/${stub.dir}/.csvs.csv`,
      "utf8",
    );

    expect(dotcsvs).toBe("csvs,0.0.2");

    expect(git.init).toHaveBeenCalledWith(
      expect.objectContaining({
        dir: `/${stub.dir}`,
        defaultBranch: "main",
      }),
    );
  });

  test("creates root", async () => {
    await createRepo("root");

    const listing = await fs.promises.readdir("/");

    expect(listing).toEqual(["root"]);

    const gitignore = await fs.promises.readFile(`/root/.gitignore`, "utf8");

    expect(gitignore).toBe(".DS_Store");

    const dotcsvs = await fs.promises.readFile(`/root/.csvs.csv`, "utf8");

    expect(dotcsvs).toBe("csvs,0.0.2");

    expect(git.init).toHaveBeenCalledWith(
      expect.objectContaining({
        dir: `/root`,
        defaultBranch: "main",
      }),
    );
  });

  test("throws when root exists", async () => {
    await createRepo("root");

    await expect(createRepo("root")).rejects.toThrowError();
  });
});

describe("clone", () => {
  beforeEach(() => {
    fs.init("test", { wipe: true });
  });

  test("throws if dir exists", async () => {
    // create dir
    await fs.promises.mkdir(`/${stub.dir}`);

    // try to clone
    await expect(
      clone(stub.uuid, stub.remote, stub.token, stub.name),
    ).rejects.toThrowError();
  });

  test("calls git.clone", async () => {
    await clone(stub.uuid, stub.remote, undefined, stub.name);

    expect(git.clone).toHaveBeenCalledWith(
      expect.objectContaining({
        dir: `/${stub.dir}`,
        url: stub.remote,
        singleBranch: true,
        //onAuth: undefined
      }),
    );

    expect(git.setConfig).toHaveBeenCalledWith(
      expect.objectContaining({
        dir: `/${stub.dir}`,
        path: "remote.origin.url",
        value: stub.remote,
      }),
    );
  });

  test("passes token", async () => {
    await clone(stub.uuid, stub.remote, stub.token, stub.name);

    expect(git.clone).toHaveBeenCalledWith(
      expect.objectContaining({
        dir: `/${stub.dir}`,
        url: stub.remote,
        singleBranch: true,
        onAuth: expect.any(Function),
      }),
    );

    expect(git.setConfig).toHaveBeenCalledWith(
      expect.objectContaining({
        dir: `/${stub.dir}`,
        path: "remote.origin.url",
        value: stub.remote,
      }),
    );
  });
});

//describe("commit", () => {
//  test("adds", async () => {
//    expect(false).toBe(true);
//  });
//
//  test("creates message", async () => {
//    expect(false).toBe(true);
//  });
//
//  test("smudges lfs", async () => {
//    expect(false).toBe(true);
//  });
//});
//
//test("push", async () => {
//  // write test dataset
//  // push
//  // check remote git server
//  expect(false).toBe(true);
//});
//
//test("pull", async () => {
//  // write test dataset
//  // pull
//  // check git log
//  expect(false).toBe(true);
//});
//
//test("listRemotes", async () => {
//  // write test dataset
//  // list remotes
//  // check remotes
//  expect(false).toBe(true);
//});
//
//test("addRemote", async () => {
//  // write test dataset
//  // add remote
//  // check remotes
//  expect(false).toBe(true);
//});
//
//test("getRemote", async () => {
//  // write test dataset
//  // get remote
//  // check remote
//  expect(false).toBe(true);
//});
