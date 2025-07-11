import http from "isomorphic-git/http/web/index.cjs";
import git from "isomorphic-git";
import { addLFS } from "@/api/browser/lfs.js";
import { fs } from "@/api/browser/lightningfs.js";
import { findDir, rimraf } from "@/api/browser/io.js";

export function nameDir(uuid, name) {
  if (uuid === undefined) throw "uuid is undefined";

  return `/${uuid}${name !== undefined ? `-${name}` : ""}`;
}

export async function createRepo(uuid, name) {
  const dir = nameDir(uuid, name);

  if (uuid === "root") {
    // should fail if root exists
    await fs.promises.mkdir(dir);
  } else {
    try {
      const existingRepo = await findDir(uuid);

      if (existingRepo !== dir) {
        await fs.promises.rename(`/${existingRepo}`, dir);
      }
    } catch {
      await fs.promises.mkdir(dir);

      await git.init({ fs, dir, defaultBranch: "main" });

      await fs.promises.writeFile(`${dir}/.gitignore`, `.DS_Store`, "utf8");

      await fs.promises.writeFile(`${dir}/.csvs.csv`, "csvs,0.0.2", "utf8");
    }
  }
}

export async function commit(uuid) {
  const dir = await findDir(uuid);

  const message = [];

  const matrix = await git.statusMatrix({
    fs,
    dir,
  });

  for (let [filepath, HEADStatus, workingDirStatus, stageStatus] of matrix) {
    if (HEADStatus === workingDirStatus && workingDirStatus === stageStatus) {
      await git.resetIndex({
        fs,
        dir,
        filepath,
      });

      [filepath, HEADStatus, workingDirStatus, stageStatus] =
        await git.statusMatrix({
          fs,
          dir,
          filepaths: [filepath],
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
          filepath,
        });
      } else {
        try {
          // fails if filepath is not lfs
          await addLFS(dir, filepath);
        } catch {
          await git.add({
            fs,
            dir,
            filepath,
          });
        }

        if (HEADStatus === 1) {
          status = "modified";
        } else {
          status = "added";
        }
      }

      message.push(`${filepath} ${status}`);
    }
  }

  if (message.length !== 0) {
    await git.commit({
      fs,
      dir,
      author: {
        name: "name",
        email: "name@mail.com",
      },
      message: message.toString(),
    });
  }
}

export async function clone(uuid, name, remoteUrl, remoteToken) {
  const dir = nameDir(uuid, name);

  try {
    await findDir(uuid);

    // remove existing directory
    await rimraf(dir);
  } catch {
    // do nothing
  }

  const options = {
    fs,
    http,
    dir,
    url: remoteUrl,
    singleBranch: true,
  };

  if (remoteToken !== undefined) {
    options.onAuth = () => ({
      username: remoteToken,
    });
  }

  try {
    await git.clone(options);
  } catch (e) {
    // if clone failed, remove directory
    await rimraf(dir);

    console.log(e);
    throw e;
  }

  await git.setConfig({
    fs,
    dir,
    path: "remote.origin.url",
    value: remoteUrl,
  });

  if (remoteToken !== undefined) {
    await git.setConfig({
      fs,
      dir,
      path: "remote.origin.token",
      value: remoteToken,
    });
  }
}

export async function listRemotes(uuid) {
  const dir = await findDir(uuid);

  const remotes = await git.listRemotes({
    fs,
    dir,
  });

  return remotes.map((r) => r.remote);
}

export async function addRemote(uuid, remoteName, remoteUrl, remoteToken) {
  const dir = await findDir(uuid);

  await git.addRemote({
    fs,
    dir,
    remote: remoteName,
    url: remoteUrl,
  });

  if (remoteToken !== undefined) {
    await git.setConfig({
      fs,
      dir,
      path: `remote.${remoteName}.token`,
      value: remoteToken,
    });
  }
}

export async function getRemote(uuid, remoteName) {
  if (remoteName === undefined)
    throw Error("can't get remote, remote undefined");

  const dir = await findDir(uuid);

  const remoteUrl = await git.getConfig({
    fs,
    dir,
    path: `remote.${remoteName}.url`,
  });

  const remoteToken = await git.getConfig({
    fs,
    dir,
    path: `remote.${remoteName}.token`,
  });

  return [remoteUrl, remoteToken];
}

// must pass remote name for fastForward
export async function pull(uuid, remoteName, remoteUrl, remoteToken) {
  const dir = await findDir(uuid);

  const tokenPartial = remoteToken
    ? {
        onAuth: () => ({
          username: remoteToken,
        }),
      }
    : {};

  // fastForward instead of pull
  // https://github.com/isomorphic-git/isomorphic-git/issues/1073
  await git.fastForward({
    fs,
    http,
    dir,
    url: remoteUrl,
    remote: remoteName,
    ...tokenPartial,
  });
}

// must pass remote name here for push
export async function push(uuid, remoteName, remoteUrl, remoteToken) {
  const dir = await findDir(uuid);

  const tokenPartial = remoteToken
    ? {
        onAuth: () => ({
          username: remoteToken,
        }),
      }
    : {};

  await git.push({
    fs,
    http,
    force: true,
    dir,
    url: remoteUrl,
    remote: remoteName,
    ...tokenPartial,
  });
}
