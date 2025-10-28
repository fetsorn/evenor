import { expect, test, describe, beforeEach, afterEach, vi } from "vitest";
import git from "isomorphic-git";
import { fs } from "@/api/browser/lightningfs.js";
import {
  nameMind,
  init,
  commit,
  clone,
  resolve,
  setOrigin,
  getOrigin,
} from "@/api/browser/git.js";
import stub from "./stub.js";

vi.mock("isomorphic-git", async (importOriginal) => {
  const mod = await importOriginal();

  return {
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
    addRemote: vi.fn(mod.addRemote),
    getConfig: vi.fn(mod.getConfig),
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
      addRemote: vi.fn(mod.addRemote),
      getConfig: vi.fn(mod.getConfig),
    },
  };
});

describe("nameMind", () => {
  test("throws if mind is undefined", async () => {
    expect(() => nameMind(undefined, stub.name)).toThrowError();
  });

  test("concatenates a name", async () => {
    expect(nameMind(stub.mind, stub.name)).toBe(stub.dirpath);
  });

  test("returns mind when name is undefined", async () => {
    expect(nameMind("root", undefined)).toBe("/root");
  });
});

describe("init", () => {
  beforeEach(() => {
    fs.init("test", { wipe: true });

    git.init.mockReset();
  });

  afterEach(async () => {
    // for lightning fs to release mutex on indexedDB
    await new Promise((resolve) => setTimeout(resolve, 500));
  });

  test("creates a directory", async () => {
    await init(stub.mind, stub.name);

    const listing = await fs.promises.readdir("/");

    expect(listing).toEqual([stub.dir]);

    const gitignore = await fs.promises.readFile(
      `${stub.dirpath}/.gitignore`,
      "utf8",
    );

    expect(gitignore).toBe(".DS_Store");

    const dotcsvs = await fs.promises.readFile(
      `${stub.dirpath}/.csvs.csv`,
      "utf8",
    );

    expect(dotcsvs).toBe("csvs,0.0.2");

    expect(git.init).toHaveBeenCalledWith(
      expect.objectContaining({
        dir: stub.dirpath,
        defaultBranch: "main",
      }),
    );
  });

  test("creates root", async () => {
    await init("root");

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
    await init("root");

    await expect(init("root")).rejects.toThrowError();
  });

  test("renames a directory", async () => {
    await init(stub.dir);

    const newName = "newName";

    const newDir = `${stub.mind}-${newName}`;

    await init(stub.mind, newName);

    const listing = await fs.promises.readdir("/");

    expect(listing).toEqual([newDir]);
  });
});

describe("clone", () => {
  beforeEach(() => {
    fs.init("test", { wipe: true });

    git.clone.mockReset();
    git.setConfig.mockReset();
  });

  afterEach(async () => {
    // for lightning fs to release mutex on indexedDB
    await new Promise((resolve) => setTimeout(resolve, 500));
  });

  test("removes and overwrites if dir exists", async () => {
    // create dir
    await fs.promises.mkdir(stub.dirpath);

    // try to clone
    await clone(stub.mind, { url: stub.url, token: stub.token });
  });

  test("calls git.clone", async () => {
    await clone(stub.mind, { url: stub.url, token: stub.token });

    expect(git.clone).toHaveBeenCalledWith(
      expect.objectContaining({
        dir: stub.dirpath,
        url: stub.url,
        singleBranch: true,
        onAuth: expect.any(Function),
      }),
    );

    expect(git.setConfig).toHaveBeenCalledWith(
      expect.objectContaining({
        dir: stub.dirpath,
        path: "remote.origin.token",
        value: stub.token,
      }),
    );
  });
});

describe("commit", () => {
  beforeEach(() => {
    fs.init("test", { wipe: true });
  });

  afterEach(async () => {
    // for lightning fs to release mutex on indexedDB
    await new Promise((resolve) => setTimeout(resolve, 500));
  });

  test("throws when no mind", async () => {
    await expect(commit(stub.mind)).rejects.toThrowError();
  });

  test("adds", async () => {
    await init(stub.mind, stub.name);

    await commit(stub.mind);

    expect(git.statusMatrix).toHaveBeenCalledWith(
      expect.objectContaining({
        dir: stub.dirpath,
      }),
    );

    expect(git.add).toHaveBeenCalledWith(
      expect.objectContaining({
        dir: stub.dirpath,
        filepath: ".csvs.csv",
      }),
    );

    expect(git.commit).toHaveBeenCalledWith(
      expect.objectContaining({
        dir: stub.dirpath,
        author: {
          name: "name",
          email: "name@mail.com",
        },
        message: ".csvs.csv added,.gitignore added",
      }),
    );
  });
});

describe("getOrigin", () => {
  beforeEach(() => {
    fs.init("test", { wipe: true });
  });

  afterEach(async () => {
    // for lightning fs to release mutex on indexedDB
    await new Promise((resolve) => setTimeout(resolve, 500));
  });

  test("throws when no mind", async () => {
    await expect(getOrigin(stub.mind)).rejects.toThrowError();
  });

  test("throws when remote undefined", async () => {
    await init(stub.mind, stub.name);

    await commit(stub.mind);

    await expect(getOrigin(stub.mind)).rejects.toThrowError();
  });

  test("calls git", async () => {
    await init(stub.mind, stub.name);

    await commit(stub.mind);

    await setOrigin(stub.mind, { url: stub.url, token: stub.token });

    const { url: remoteUrl, token: remoteToken } = await getOrigin(stub.mind);

    expect(git.getConfig).toHaveBeenCalledWith(
      expect.objectContaining({
        dir: stub.dirpath,
        path: `remote.origin.url`,
      }),
    );

    expect(git.getConfig).toHaveBeenCalledWith(
      expect.objectContaining({
        dir: stub.dirpath,
        path: `remote.origin.token`,
      }),
    );

    expect(remoteUrl).toBe(stub.url);

    expect(remoteToken).toBe(stub.token);
  });
});

describe("setOrigin", () => {
  beforeEach(() => {
    fs.init("test", { wipe: true });
  });

  afterEach(async () => {
    // for lightning fs to release mutex on indexedDB
    await new Promise((resolve) => setTimeout(resolve, 500));
  });

  test("throws when no mind", async () => {
    await expect(
      setOrigin(stub.mind, { url: stub.url, token: stub.token }),
    ).rejects.toThrowError();
  });

  test("calls git", async () => {
    await init(stub.mind, stub.name);

    await commit(stub.mind);

    await setOrigin(stub.mind, { url: stub.url, token: stub.token });

    expect(git.addRemote).toHaveBeenCalledWith(
      expect.objectContaining({
        dir: stub.dirpath,
        remote: "origin",
        url: stub.url,
      }),
    );

    expect(git.setConfig).toHaveBeenCalledWith(
      expect.objectContaining({
        dir: stub.dirpath,
        path: `remote.origin.token`,
        value: stub.token,
      }),
    );
  });
});

describe("resolve", () => {
  beforeEach(() => {
    fs.init("test", { wipe: true });
  });

  afterEach(async () => {
    // for lightning fs to release mutex on indexedDB
    await new Promise((resolve) => setTimeout(resolve, 500));
  });

  test("throws if no mind", async () => {
    await expect(
      resolve(stub.mind, { url: stub.url, token: stub.token }),
    ).rejects.toThrowError();
  });

  test("calls git", async () => {
    await init(stub.mind, stub.name);

    await commit(stub.mind);

    await setOrigin(stub.mind, { url: stub.url, token: stub.token });

    await resolve(stub.mind, { url: stub.url, token: stub.token });

    expect(git.fastForward).toHaveBeenCalledWith(
      expect.objectContaining({
        dir: stub.dirpath,
        url: stub.url,
        remote: "origin",
        onAuth: expect.any(Function),
      }),
    );
  });
});
