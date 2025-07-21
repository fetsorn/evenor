import { expect, test, describe, beforeEach, afterEach, vi } from "vitest";
import git from "isomorphic-git";
import lfs from "@fetsorn/isogit-lfs";
import { saveAs } from "file-saver";
import { fs } from "@/api/browser/lightningfs.js";
import { init, commit, setOrigin } from "@/api/browser/git.js";
import { writeFile } from "@/api/browser/io.js";
import {
  lfsDir,
  addLFS,
  createLFS,
  fetchAsset,
  putAsset,
  uploadFile,
  uploadBlobsLFS,
  downloadAsset,
  downloadUrlFromPointer,
  setAssetPath,
  getAssetPath,
} from "@/api/browser/lfs.js";
import stub from "./stub.js";

vi.mock("isomorphic-git", async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    default: {
      ...mod,
      setConfig: vi.fn(mod.setConfig),
      getConfigAll: vi.fn(mod.getConfigAll),
    },
  };
});

vi.mock("file-saver", async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    saveAs: vi.fn(),
  };
});

vi.mock("@fetsorn/isogit-lfs", async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    default: {
      ...mod,
      addLFS: vi.fn(),
      readPointer: vi.fn(() => stub.pointer),
      downloadUrlFromPointer: vi.fn(),
      pointsToLFS: vi.fn(),
      downloadBlobFromPointer: vi.fn(() =>
        new TextEncoder().encode(stub.content),
      ),
      uploadBlobs: vi.fn(),
    },
  };
});

vi.mock("@/api/browser/io.js", async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    fetchFile: vi.fn(mod.fetchFile),
    writeFile: vi.fn(mod.writeFile),
    pickFile: vi.fn(() => [stub.file]),
  };
});

describe("createLFS", () => {
  beforeEach(() => {
    fs.init("test", { wipe: true });
  });

  afterEach(async () => {
    // for lightning fs to release mutex on indexedDB
    await new Promise((resolve) => setTimeout(resolve, 500));
  });

  test("throws if no mind", async () => {
    await expect(createLFS(stub.mind)).rejects.toThrowError();
  });

  test("writes git config", async () => {
    await init(stub.mind, stub.name);

    await commit(stub.mind);

    await createLFS(stub.mind);

    // writes .gitattributes
    const gitattributes = await fs.promises.readFile(
      `${stub.dirpath}/.gitattributes`,
      "utf8",
    );

    //console.log(gitattributes);
    expect(gitattributes).toBe(
      `${lfsDir}/** filter=lfs diff=lfs merge=lfs -text\n`,
    );

    // sets git config
    const gitconfig = await fs.promises.readFile(
      `${stub.dirpath}/.git/config`,
      "utf8",
    );

    expect(gitconfig).toBe(`

[filter "lfs"]
	required = true
	process = git-lfs filter-process
	smudge = git-lfs smudge -- %f
	clean = git-lfs clean -- %f`);
  });
});

// git commit smudges lfs
describe("addLFS", () => {
  beforeEach(() => {
    fs.init("test", { wipe: true });
  });

  afterEach(async () => {
    // for lightning fs to release mutex on indexedDB
    await new Promise((resolve) => setTimeout(resolve, 500));
  });

  test("throws if not lfs dir", async () => {
    await expect(addLFS(stub.dirpath, stub.filename)).rejects.toThrowError();
  });

  test("calls isogit-lfs", async () => {
    const assetPath = `${lfsDir}/${stub.filename}`;

    await addLFS(stub.dirpath, assetPath);

    expect(lfs.addLFS).toHaveBeenCalledWith(
      expect.objectContaining({ dir: stub.dirpath, filepath: assetPath }),
    );
  });
});

describe("putAsset", () => {
  beforeEach(() => {
    fs.init("test", { wipe: true });
  });

  afterEach(async () => {
    // for lightning fs to release mutex on indexedDB
    await new Promise((resolve) => setTimeout(resolve, 500));
  });

  test("throws if no mind", async () => {
    await expect(
      putAsset(stub.mind, stub.filename, stub.content),
    ).rejects.toThrowError();
  });

  test("calls io", async () => {
    await init(stub.mind, stub.name);

    await commit(stub.mind);

    const filepath = `${lfsDir}/${stub.filename}`;

    await putAsset(stub.mind, stub.filename, stub.content);

    expect(writeFile).toHaveBeenCalledWith(stub.mind, filepath, stub.content);
  });
});

test("downloadAsset", async () => {
  downloadAsset(stub.content, stub.filename);

  expect(saveAs).toHaveBeenCalledWith(stub.content, stub.filename);
});

describe("setAssetPath", () => {
  beforeEach(() => {
    fs.init("test", { wipe: true });
  });

  afterEach(async () => {
    // for lightning fs to release mutex on indexedDB
    await new Promise((resolve) => setTimeout(resolve, 500));
  });

  test("throws if no mind", async () => {
    await expect(setAssetPath(stub.mind, stub.dirpath)).rejects.toThrowError();
  });

  test("setAssetPath", async () => {
    await init(stub.mind, stub.name);

    await commit(stub.mind);

    await setAssetPath(stub.mind, stub.dirpath);

    expect(git.setConfig).toHaveBeenCalledWith(
      expect.objectContaining({
        dir: stub.dirpath,
        path: "asset.path",
        value: stub.dirpath,
      }),
    );
  });
});

describe("getAssetPath", () => {
  beforeEach(() => {
    fs.init("test", { wipe: true });
  });

  afterEach(async () => {
    // for lightning fs to release mutex on indexedDB
    await new Promise((resolve) => setTimeout(resolve, 500));
  });

  test("throws if no mind", async () => {
    await expect(getAssetPath(stub.mind)).rejects.toThrowError();
  });

  test("calls git", async () => {
    await init(stub.mind, stub.name);

    await commit(stub.mind);

    await getAssetPath(stub.mind, stub.dirpath);

    expect(git.getConfigAll).toHaveBeenCalledWith(
      expect.objectContaining({
        dir: stub.dirpath,
        path: "asset.path",
      }),
    );
  });

  test("reads asset path", async () => {
    await init(stub.mind, stub.name);

    await commit(stub.mind);

    await setAssetPath(stub.mind, stub.dirpath);

    const listing = await getAssetPath(stub.mind, stub.dirpath);

    expect(listing).toEqual([stub.dirpath]);
  });
});

test("downloadUrlFromPointer", async () => {
  await downloadUrlFromPointer(stub.url, stub.token, stub.pointer);

  expect(lfs.downloadUrlFromPointer).toHaveBeenCalledWith(
    expect.objectContaining({
      url: stub.url,
      auth: expect.objectContaining({
        username: stub.token,
        password: stub.token,
      }),
      info: stub.pointer,
    }),
  );
});

describe("fetchAsset", () => {
  beforeEach(() => {
    fs.init("test", { wipe: true });
  });

  afterEach(async () => {
    // for lightning fs to release mutex on indexedDB
    await new Promise((resolve) => setTimeout(resolve, 500));
  });

  test("throws if no mind", async () => {
    await expect(fetchAsset(stub.mind, stub.filename)).rejects.toThrowError();
  });

  test("fetches a blob from pointer", async () => {
    await init(stub.mind, stub.name);

    await commit(stub.mind);

    await setOrigin(stub.mind, stub.url, stub.token);

    await fs.promises.mkdir(`${stub.dirpath}/${lfsDir}`);

    await fs.promises.writeFile(
      `${stub.dirpath}/${lfsDir}/${stub.filename}`,
      stub.content,
    );

    await commit(stub.mind);

    // always assume it's a pointer and try to fetch
    lfs.pointsToLFS.mockImplementation(() => true);

    const content = await fetchAsset(stub.mind, stub.filename);

    expect(lfs.downloadBlobFromPointer).toHaveBeenCalledWith(
      expect.objectContaining({
        url: stub.url,
        auth: expect.objectContaining({
          username: stub.token,
          password: stub.token,
        }),
        pointer: stub.pointer,
      }),
    );

    expect(JSON.stringify(content)).toBe(JSON.stringify(stub.encoded));
  });
});

describe("uploadBlobsLFS", () => {
  beforeEach(() => {
    fs.init("test", { wipe: true });
  });

  afterEach(async () => {
    // for lightning fs to release mutex on indexedDB
    await new Promise((resolve) => setTimeout(resolve, 500));
  });

  test("throws if no mind", async () => {
    await expect(
      uploadBlobsLFS(stub.mind, stub.remote, []),
    ).rejects.toThrowError();
  });

  test("uploads files from parameters", async () => {
    await init(stub.mind, stub.name);

    await commit(stub.mind);

    await setOrigin(stub.mind, stub.url, stub.token);

    // clear call history
    lfs.uploadBlobs.mockReset();

    await uploadBlobsLFS(stub.mind, stub.url, stub.token, [""]);

    expect(lfs.uploadBlobs).toHaveBeenCalledWith(
      {
        url: stub.url,
        auth: {
          username: stub.token,
          password: stub.token,
        },
      },
      [""],
    );
  });

  test("uploads files from asset path", async () => {
    await init(stub.mind, stub.name);

    await commit(stub.mind);

    await setOrigin(stub.mind, stub.url, stub.token);

    await fs.promises.mkdir(`${stub.dirpath}/${lfsDir}`);

    await fs.promises.writeFile(
      `${stub.dirpath}/${lfsDir}/${stub.filename}`,
      stub.content,
    );

    // clear call history
    lfs.uploadBlobs.mockReset();

    // always assume it's a binary and try to upload
    lfs.pointsToLFS.mockImplementation((content) => {
      return JSON.stringify(content) === JSON.stringify(stub.encoded)
        ? false
        : true;
    });

    await uploadBlobsLFS(stub.mind, stub.url, stub.token, undefined);

    expect(lfs.uploadBlobs).toHaveBeenCalledWith(
      {
        url: stub.url,
        auth: {
          username: stub.token,
          password: stub.token,
        },
      },
      [expect.objectContaining({ 0: stub.encoded[0] })],
    );
  });
});

describe("uploadFile", () => {
  beforeEach(() => {
    fs.init("test", { wipe: true });
  });

  afterEach(async () => {
    // for lightning fs to release mutex on indexedDB
    await new Promise((resolve) => setTimeout(resolve, 500));
  });

  test("throws if no mind", async () => {
    await expect(
      uploadBlobsLFS(stub.mind, stub.remote, []),
    ).rejects.toThrowError();
  });

  test("uploads a file", async () => {
    await init(stub.mind, stub.name);

    await commit(stub.mind);

    await fs.promises.mkdir(`${stub.dirpath}/${lfsDir}`);

    const metadata = await uploadFile(stub.mind);

    expect(metadata).toEqual([
      {
        extension: stub.fileextension,
        hash: stub.hash,
        name: stub.basename,
      },
    ]);

    const content = await fs.promises.readFile(
      `${stub.dirpath}/${lfsDir}/${stub.hash}.${stub.fileextension}`,
      "utf8",
    );

    expect(content).toBe(stub.content);
  });
});
