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
      init: vi.fn(mod.init),
      clone: vi.fn(),
      statusMatrix: vi.fn(mod.statusMatrix),
      resetIndex: vi.fn(mod.resetIndex),
      remove: vi.fn(mod.remove),
      add: vi.fn(mod.add),
      commit: vi.fn(mod.commit),
      setConfig: vi.fn(mod.setConfig),
      fastForward: vi.fn(),
      push: vi.fn(),
      listRemotes: vi.fn(mod.listRemotes),
      addRemote: vi.fn(mod.addRemote),
      getConfig: vi.fn(mod.getConfig),
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
      clone(stub.uuid, stub.url, stub.token, stub.name),
    ).rejects.toThrowError();
  });

  test("calls git.clone", async () => {
    await clone(stub.uuid, stub.url, undefined, stub.name);

    expect(git.clone).toHaveBeenCalledWith(
      expect.objectContaining({
        dir: `/${stub.dir}`,
        url: stub.url,
        singleBranch: true,
        //onAuth: undefined
      }),
    );

    expect(git.setConfig).toHaveBeenCalledWith(
      expect.objectContaining({
        dir: `/${stub.dir}`,
        path: "remote.origin.url",
        value: stub.url,
      }),
    );
  });

  test("passes token", async () => {
    await clone(stub.uuid, stub.url, stub.token, stub.name);

    expect(git.clone).toHaveBeenCalledWith(
      expect.objectContaining({
        dir: `/${stub.dir}`,
        url: stub.url,
        singleBranch: true,
        onAuth: expect.any(Function),
      }),
    );

    expect(git.setConfig).toHaveBeenCalledWith(
      expect.objectContaining({
        dir: `/${stub.dir}`,
        path: "remote.origin.url",
        value: stub.url,
      }),
    );
  });
});

describe("commit", () => {
  beforeEach(() => {
    fs.init("test", { wipe: true });
  });

  test("throws when no repo", async () => {
    await expect(commit(stub.uuid)).rejects.toThrowError();
  });

  test("adds", async () => {
    await createRepo(stub.uuid, stub.name);

    await commit(stub.uuid);

    expect(git.statusMatrix).toHaveBeenCalledWith(
      expect.objectContaining({
        dir: `/${stub.dir}`,
      }),
    );

    expect(git.add).toHaveBeenCalledWith(
      expect.objectContaining({
        dir: `/${stub.dir}`,
        filepath: ".csvs.csv",
      }),
    );

    expect(git.commit).toHaveBeenCalledWith(
      expect.objectContaining({
        dir: `/${stub.dir}`,
        author: {
          name: "name",
          email: "name@mail.com",
        },
        message: ".csvs.csv added,.gitignore added",
      }),
    );
  });
});

describe("pull", () => {
  beforeEach(() => {
    fs.init("test", { wipe: true });
  });

  test("throws if no repo", async () => {
    await expect(pull(stub.uuid, undefined)).rejects.toThrowError();
  });

  test("throws if remote is undefined", async () => {
    await createRepo(stub.uuid, stub.name);

    await commit(stub.uuid);

    await expect(pull(stub.uuid, undefined)).rejects.toThrowError();
  });

  test("calls git", async () => {
    await createRepo(stub.uuid, stub.name);

    await commit(stub.uuid);

    await addRemote(stub.uuid, stub.remote, stub.url, stub.token);

    await pull(stub.uuid, stub.url);

    expect(git.fastForward).toHaveBeenCalledWith(
      expect.objectContaining({
        dir: `/${stub.dir}`,
        url: stub.url,
        onAuth: expect.any(Function),
      }),
    );
  });

  test("passes token", async () => {});
});

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
