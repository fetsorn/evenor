import git from "isomorphic-git";
import LightningFS from "@isomorphic-git/lightning-fs";
import axios from "axios";

export async function gitcommit(repoPath: string) {
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
    dir: repoPath,
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
        dir: repoPath,
        filepath: filePath,
      });

      [filePath, HEADStatus, workingDirStatus, stageStatus] =
        await git.statusMatrix({
          fs,
          dir: repoPath,
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
          dir: repoPath,
          filepath: filePath,
        });
      } else {
        await git.add({
          fs,
          dir: repoPath,
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
      dir: repoPath,
      author: {
        name: "name",
        email: "name@mail.com",
      },
      message: message.toString(),
    });
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
