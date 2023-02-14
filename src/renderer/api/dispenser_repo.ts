import git from "isomorphic-git";
import http from "isomorphic-git/http/web";
import LightningFS from "@isomorphic-git/lightning-fs";
import axios from "axios";
import { manifestRoot } from "@/../lib/git_template";

export async function gitcommit(dir: string) {
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
    dir,
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
        dir,
        filepath: filePath,
      });

      [filePath, HEADStatus, workingDirStatus, stageStatus] =
        await git.statusMatrix({
          fs,
          dir,
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
          dir,
          filepath: filePath,
        });
      } else {
        await git.add({
          fs,
          dir,
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
      dir,
      author: {
        name: "name",
        email: "name@mail.com",
      },
      message: message.toString(),
    });
  }
}

export async function addRemote(dir: string, url: string) {
  const fs = new LightningFS("fs");

  await git.addRemote({
    fs,
    dir,
    remote: 'upstream',
    url,
    force: true,
  })
}

export async function pull(dir: string, token: string) {
  const fs = new LightningFS("fs");

  // console.log("gitPull");
  // fastForward instead of pull
  // https://github.com/isomorphic-git/isomorphic-git/issues/1073
  await git.fastForward({
    fs,
    http,
    dir,
    remote: "upstream",
    onAuth: () => ({
      username: token,
    }),
  });
}

export async function push(dir: string, token: string) {
  const fs = new LightningFS("fs");

  // console.log("gitPush");
  await git.push({
    fs,
    http,
    force: true,
    dir,
    remote: "upstream",
    onAuth: () => ({
      username: token,
    }),
  });
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

async function ensureRepoBrowser(repo: string, schema: string) {
  console.log('ensureRepoBrowser', repo, schema)
  const fs = new LightningFS("fs");

  const pfs = fs.promises;

  if (!(await pfs.readdir("/")).includes("store")) {
    await pfs.mkdir("/store");
  }

  const repoDir = "/store/" + repo;

  if (!(await pfs.readdir("/store")).includes(repo)) {
    await pfs.mkdir(repoDir);

    await git.init({ fs: fs, dir: repoDir });
  }

  await pfs.writeFile(repoDir + "/metadir.json", schema, "utf8");

  await gitcommit(repoDir);
}

async function ensureRepo(repo: string, schema: string) {
  try {
    switch (__BUILD_MODE__) {
    case "electron":
      return await window.electron.ensureRepo(repo, schema);

    default:
      return await ensureRepoBrowser(repo, schema);
    }
  } catch (e) {
    throw Error(`${e}`);
  }
}

async function linkRepoBrowser(repodir: string, reponame: string) {
  const pfs = new LightningFS("fs").promises;

  if (!(await pfs.readdir("/")).includes("repos")) {
    await pfs.mkdir("/repos");
  }

  await pfs.symlink(`/store/${repodir}`, `/repos/${reponame}`);
}

async function linkRepo(repodir: string, reponame: string) {
  try {
    switch (__BUILD_MODE__) {
    case "electron":
      return await window.electron.linkRepo(repodir, reponame);

    default:
      return await linkRepoBrowser(repodir, reponame);
    }
  } catch (e) {
    throw Error(`${e}`);
  }
}

export async function updateRepo(entry: any) {
  await ensureRepo(entry.UUID, entry.schema);

  await linkRepo(entry.UUID, entry.reponame);
}

export async function ensureRoot() {
  // try {
  //   await rimraf("/store/root");
  // } catch (e) {
  //   console.log("rimraf failed");
  // }

  await ensureRepo("root", manifestRoot);
}

export async function deleteRepo(entry: any) {
  await rimraf(`/store/${entry.UUID}`);

  // TODO: unlink symlink
}

function lastUrlDir(url: string) {
  return url.substring(url.lastIndexOf("/") + 1).replace(/\.[^/.]+$/, "");
}

export async function clone(
  url: string,
  token: string,
  dir: string
) {
  const fs = new LightningFS("fs");

  console.log("AAAA", url, token, dir);

  // attempt to clone a public repo if no token is provided
  if (token === "") {
    console.log("1", url, token, dir);
    await git.clone({
      fs,
      http,
      dir,
      url,
      singleBranch: true,
      depth: 1,
    });
  } else {
    console.log("2", url, token, dir);
    await git.clone({
      fs,
      http,
      dir,
      url,
      singleBranch: true,
      depth: 1,
      onAuth: () => ({
        username: token,
      }),
    });
  }
}

export async function cloneRepoBrowser(
  url: string,
  token: string,
) {
  const pfs = new LightningFS("fs").promises;

  if (!(await pfs.readdir("/")).includes("store")) {
    await pfs.mkdir("/store");
  }

  try {
    await rimraf("/store/view");
  } catch {
    //
  }

  await clone(url, token, "/store/view");
}

export async function cloneRepo(url: string, token: string) {
  try {
    switch (__BUILD_MODE__) {
    case "electron":
      return await window.electron.clone(url, token, "store/view");

    default:
      return await cloneRepoBrowser(url, token);
    }
  } catch (e) {
    throw Error(`${e}`);
  }
}

