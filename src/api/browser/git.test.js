import { expect, test, describe, beforeEach, afterEach, vi } from "vitest";
import git from "isomorphic-git";
import { fs } from "./lightningfs.js";
import {
  nameDir,
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

describe("nameDir", () => {
  test("throws if uuid is undefined", async () => {
    expect(() => nameDir(undefined, stub.name)).toThrowError();
  });

  test("concatenates a name", async () => {
    expect(nameDir(stub.uuid, stub.name)).toBe(stub.dirpath);
  });

  test("returns uuid when name is undefined", async () => {
    expect(nameDir("root", undefined)).toBe("/root");
  });
});

describe("createRepo", () => {
  beforeEach(() => {
    fs.init("test", { wipe: true });
  });

  afterEach(async () => {
    // for lightning fs to release mutex on indexedDB
    await new Promise((resolve) => setTimeout(resolve, 500));
  });

  test("creates a directory", async () => {
    await createRepo(stub.uuid, stub.name);

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

  test("renames a directory", async () => {
    await createRepo(stub.dir);

    const newName = "newName";

    const newDir = `${stub.uuid}-${newName}`;

    await createRepo(stub.uuid, newName);

    const listing = await fs.promises.readdir("/");

    expect(listing).toEqual([newDir]);
  });
});

describe("clone", () => {
  beforeEach(() => {
    fs.init("test", { wipe: true });
  });

  afterEach(async () => {
    // for lightning fs to release mutex on indexedDB
    await new Promise((resolve) => setTimeout(resolve, 500));
  });

  test("throws if dir exists", async () => {
    // create dir
    await fs.promises.mkdir(stub.dirpath);

    // try to clone
    await expect(
      clone(stub.uuid, stub.url, stub.token, stub.name),
    ).rejects.toThrowError();
  });

  test("calls git.clone", async () => {
    await clone(stub.uuid, stub.url, stub.token, stub.name);

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
        path: "remote.origin.url",
        value: stub.url,
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

  test("throws when no repo", async () => {
    await expect(commit(stub.uuid)).rejects.toThrowError();
  });

  test("adds", async () => {
    await createRepo(stub.uuid, stub.name);

    await commit(stub.uuid);

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

describe("getRemote", () => {
  beforeEach(() => {
    fs.init("test", { wipe: true });
  });

  afterEach(async () => {
    // for lightning fs to release mutex on indexedDB
    await new Promise((resolve) => setTimeout(resolve, 500));
  });

  test("throws when no repo", async () => {
    await expect(getRemote(stub.uuid, stub.remote)).rejects.toThrowError();
  });

  test("throws when remote undefined", async () => {
    await createRepo(stub.uuid, stub.name);

    await commit(stub.uuid);

    await expect(getRemote(stub.uuid, undefined)).rejects.toThrowError();
  });

  test("calls git", async () => {
    await createRepo(stub.uuid, stub.name);

    await commit(stub.uuid);

    await addRemote(stub.uuid, stub.remote, stub.url, stub.token);

    const [remoteUrl, remoteToken] = await getRemote(stub.uuid, stub.remote);

    expect(git.getConfig).toHaveBeenCalledWith(
      expect.objectContaining({
        dir: stub.dirpath,
        path: `remote.${stub.remote}.url`,
      }),
    );

    expect(git.getConfig).toHaveBeenCalledWith(
      expect.objectContaining({
        dir: stub.dirpath,
        path: `remote.${stub.remote}.token`,
      }),
    );

    expect(remoteUrl).toBe(stub.url);

    expect(remoteToken).toBe(stub.token);
  });
});

describe("addRemote", () => {
  beforeEach(() => {
    fs.init("test", { wipe: true });
  });

  afterEach(async () => {
    // for lightning fs to release mutex on indexedDB
    await new Promise((resolve) => setTimeout(resolve, 500));
  });

  test("throws when no repo", async () => {
    await expect(
      addRemote(stub.uuid, stub.remote, stub.url, stub.token),
    ).rejects.toThrowError();
  });

  test("calls git", async () => {
    await createRepo(stub.uuid, stub.name);

    await commit(stub.uuid);

    await addRemote(stub.uuid, stub.remote, stub.url, stub.token);

    expect(git.addRemote).toHaveBeenCalledWith(
      expect.objectContaining({
        dir: stub.dirpath,
        remote: stub.remote,
        url: stub.url,
      }),
    );

    expect(git.setConfig).toHaveBeenCalledWith(
      expect.objectContaining({
        dir: stub.dirpath,
        path: `remote.${stub.remote}.token`,
        value: stub.token,
      }),
    );
  });
});

describe("listRemotes", () => {
  beforeEach(() => {
    fs.init("test", { wipe: true });
  });

  afterEach(async () => {
    // for lightning fs to release mutex on indexedDB
    await new Promise((resolve) => setTimeout(resolve, 500));
  });

  test("throws when no repo", async () => {
    await expect(listRemotes(stub.uuid)).rejects.toThrowError();
  });

  test("empty when no remotes", async () => {
    await createRepo(stub.uuid, stub.name);

    await commit(stub.uuid);

    const remotes = await listRemotes(stub.uuid);

    expect(git.listRemotes).toHaveBeenCalledWith(
      expect.objectContaining({
        dir: stub.dirpath,
      }),
    );

    expect(remotes).toEqual([]);
  });

  test("finds remotes", async () => {
    await createRepo(stub.uuid, stub.name);

    await commit(stub.uuid);

    await addRemote(stub.uuid, stub.remote, stub.url, stub.token);

    const remotes = await listRemotes(stub.uuid);

    expect(git.listRemotes).toHaveBeenCalledWith(
      expect.objectContaining({
        dir: stub.dirpath,
      }),
    );

    expect(remotes).toEqual([stub.remote]);
  });
});

describe("pull", () => {
  beforeEach(() => {
    fs.init("test", { wipe: true });
  });

  afterEach(async () => {
    // for lightning fs to release mutex on indexedDB
    await new Promise((resolve) => setTimeout(resolve, 500));
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

    await pull(stub.uuid, stub.remote);

    expect(git.fastForward).toHaveBeenCalledWith(
      expect.objectContaining({
        dir: stub.dirpath,
        url: stub.url,
        remote: stub.remote,
        onAuth: expect.any(Function),
      }),
    );
  });
});

describe("push", () => {
  beforeEach(() => {
    fs.init("test", { wipe: true });
  });

  afterEach(async () => {
    // for lightning fs to release mutex on indexedDB
    await new Promise((resolve) => setTimeout(resolve, 500));
  });

  test("throws if no repo", async () => {
    await expect(push(stub.uuid, undefined)).rejects.toThrowError();
  });

  test("throws if remote is undefined", async () => {
    await createRepo(stub.uuid, stub.name);

    await commit(stub.uuid);

    await expect(push(stub.uuid, undefined)).rejects.toThrowError();
  });

  test("calls git", async () => {
    await createRepo(stub.uuid, stub.name);

    await commit(stub.uuid);

    await addRemote(stub.uuid, stub.remote, stub.url, stub.token);

    await push(stub.uuid, stub.remote);

    expect(git.push).toHaveBeenCalledWith(
      expect.objectContaining({
        dir: stub.dirpath,
        url: stub.url,
        remote: stub.remote,
        onAuth: expect.any(Function),
      }),
    );
  });
});
