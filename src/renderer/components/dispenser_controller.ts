import git from "isomorphic-git";
import LightningFS from "@isomorphic-git/lightning-fs";
import { manifestRoot } from "../../lib/git_template";
import axios from "axios";

export async function dispenserDelete(
  repoRoute: string,
  schema: any,
  entry: any
) {
  // if route is root, create or edit repo
  // if (repoRoute === undefined) {
  //   await deleteRepo(entry);
  // }
}

export async function dispenserUpdate(
  repoRoute: string,
  schema: any,
  entry: any
) {
  // if route is root, create or edit repo
  // if (repoRoute === undefined) {
  //   await updateRepo(entry);
  // }
}

export async function createRoot() {
  try {
    switch (__BUILD_MODE__) {
      case "electron":
        await window.electron.gitCreate("root");

      default:
        await createRootBrowser();
    }
  } catch (e) {
    throw Error(`Could not create git repo` + e);
  }
}

export async function gitcommit(repo: string) {
  // console.log("commit");

  const fs = new LightningFS("fs");

  if (__BUILD_MODE__ === "server") {
    try {
      await axios.put("api/");
    } catch (e) {
      console.log(e);
    }
  }

  const message = [];

  const statusMatrix: any = await git.statusMatrix({
    fs,
    dir: "/" + repo,
  });

  for (let [
    filePath,
    HEADStatus,
    workingDirStatus,
    stageStatus,
  ] of statusMatrix) {
    if (HEADStatus === workingDirStatus && workingDirStatus === stageStatus) {
      await git.resetIndex({
        fs,
        dir: "/" + repo,
        filepath: filePath,
      });

      [filePath, HEADStatus, workingDirStatus, stageStatus] =
        await git.statusMatrix({
          fs,
          dir: "/" + repo,
          filepaths: [filePath],
        });

      if (HEADStatus === workingDirStatus && workingDirStatus === stageStatus) {
        continue;
      }
    }

    if (workingDirStatus !== stageStatus) {
      let status;

      if (workingDirStatus === 0) {
        status = "deleted";

        await git.remove({
          fs,
          dir: "/" + repo,
          filepath: filePath,
        });
      } else {
        await git.add({
          fs,
          dir: "/" + repo,
          filepath: filePath,
        });

        if (HEADStatus === 1) {
          status = "modified";
        } else {
          status = "added";
        }
      }

      message.push(`${filePath} ${status}`);
    }
  }

  if (message.length !== 0) {
    // console.log("commit:", message.toString());

    await git.commit({
      fs: fs,
      dir: "/" + repo,
      author: {
        name: "name",
        email: "name@mail.com",
      },
      message: message.toString(),
    });
  }
}

async function createRootBrowser() {
  const fs = new LightningFS("fs");

  const pfs = fs.promises;

  const repo = "root";

  const repoDir = "/" + repo;

  if ((await pfs.readdir("/")).includes(repo)) {
    console.log("repo exists");
  } else {
    await pfs.mkdir(repoDir);

    await git.init({ fs: fs, dir: repoDir });

    await pfs.mkdir(repoDir + "/metadir");

    await pfs.writeFile(repoDir + "/metadir.json", manifestRoot, "utf8");

    await pfs.mkdir(repoDir + "/metadir/props");

    await pfs.mkdir(repoDir + "/metadir/props/reponame");

    await pfs.writeFile(
      repoDir + "/metadir/props/reponame/index.csv",
      "",
      "utf8"
    );

    await pfs.mkdir(repoDir + "/metadir/props/schema");

    await pfs.writeFile(
      repoDir + "/metadir/props/schema/index.csv",
      "",
      "utf8"
    );

    await pfs.mkdir(repoDir + "/metadir/pairs");

    await pfs.writeFile(
      repoDir + "/metadir/pairs/reponame-schema.csv",
      "",
      "utf8"
    );

    await gitcommit(repo);
  }
}

export async function ls(path: string) {
  const pfs = new LightningFS("fs").promises;

  let files;

  try {
    files = await pfs.readdir(path);
  } catch {
    throw Error(`can't read ${path} to list it`);
  }

  console.log("list ", path, ":", files);

  for (const file of files) {
    const filepath = path + "/" + file;

    const { type } = await pfs.stat(filepath);

    if (type === "dir") {
      await ls(filepath);
    }
  }
}

export async function rimraf(path: string) {
  const pfs = new LightningFS("fs").promises;

  if (__BUILD_MODE__ === "electron") {
    try {
      await window.electron.rimraf(path);
    } catch {
      throw Error(`Could not rimraf ${path}`);
    }
  } else {
    console.log("rimraf");

    let files;

    try {
      files = await pfs.readdir(path);
    } catch {
      throw Error(`can't read ${path} to rimraf it`);
    }
    console.log("rimfraf", files);
    for (const file of files) {
      const filepath = path + "/" + file;

      const { type } = await pfs.stat(filepath);

      // console.log(`${filepath} is ${type}`);

      if (type === "file") {
        // console.log("unlink", filepath);

        await pfs.unlink(filepath);
      } else if (type === "dir") {
        await rimraf(filepath);
      }
    }

    // console.log("rmdir", path);

    await pfs.rmdir(path);
  }
}

async function createRepoBrowser(repo: string, schema: string) {
  const fs = new LightningFS("fs");

  const pfs = fs.promises;

  const repoDir = "/" + repo;

  if ((await pfs.readdir("/")).includes(repo)) {
    console.log("repo exists");
  } else {
    await pfs.mkdir(repoDir);

    await git.init({ fs: fs, dir: repoDir });

    await pfs.mkdir(repoDir + "/metadir");

    await pfs.writeFile(repoDir + "/metadir.json", schema, "utf8");

    await gitcommit(repo);
  }
}

async function createRepo(repo: string, schema: string) {
  try {
    switch (__BUILD_MODE__) {
      case "electron":
        // TODO: add schema
        await window.electron.gitCreate(repo);

      default:
        await createRepoBrowser(repo, schema);
    }
  } catch (e) {
    throw Error(`Could not create git repo` + e);
  }
}

export async function ensureRepo(repo: string, schema: string) {
  const pfs = new LightningFS("fs").promises;

  // try {
  //   await rimraf("/root");
  // } catch (e) {
  //   console.log("rimraf failed");
  // }

  const files = await pfs.readdir("/");

  if (!files.includes(repo)) {
    await createRepo(repo, schema);
  }
}

export async function updateRepo(entry: any) {
  await ensureRepo(entry.UUID, entry.SCHEMA);
}

export async function deleteRepo(entry: any) {
  await rimraf("/" + entry.UUID);
}

// TODO: rewrite as a call to dispenser
export async function ensureRoot() {
  const fs = new LightningFS("fs");

  const pfs = fs.promises;

  // try {
  //   await rimraf("/root");
  // } catch (e) {
  //   console.log("rimraf failed");
  // }

  // await ls("/");

  const files = await pfs.readdir("/");

  // console.log(files);

  if (!files.includes("root")) {
    await createRoot();
  }
}
