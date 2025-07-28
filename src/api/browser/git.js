import http from "isomorphic-git/http/web/index.cjs";
import git from "isomorphic-git";
import { addLFS } from "@/api/browser/lfs.js";
import { fs } from "@/api/browser/lightningfs.js";
import { findMind, rimraf } from "@/api/browser/io.js";

/**
 * This
 * @name nameMind
 * @function
 * @param {String} mind -
 * @param {String} name -
 * @returns {String}
 */
export function nameMind(mind, name) {
  if (mind === undefined) throw "id is undefined";

  return `/${mind}${name !== undefined ? `-${name}` : ""}`;
}

/**
 * This
 * @name init
 * @function
 * @param {String} mind -
 * @param {String} name -
 */
export async function init(mind, name) {
  const dir = nameMind(mind, name);

  if (mind === "root") {
    // should fail if root exists
    await fs.promises.mkdir(dir);

    await git.init({ fs, dir, defaultBranch: "main" });

    await fs.promises.writeFile(`${dir}/.gitignore`, `.DS_Store`, "utf8");

    await fs.promises.writeFile(`${dir}/.csvs.csv`, "csvs,0.0.2", "utf8");
  } else {
    try {
      const existingMind = await findMind(mind);

      if (existingMind !== dir) {
        await fs.promises.rename(`/${existingMind}`, dir);
      }
    } catch {
      await fs.promises.mkdir(dir);

      await git.init({ fs, dir, defaultBranch: "main" });

      await fs.promises.writeFile(`${dir}/.gitignore`, `.DS_Store`, "utf8");

      await fs.promises.writeFile(`${dir}/.csvs.csv`, "csvs,0.0.2", "utf8");
    }
  }
}

/**
 * This
 * @name commit
 * @function
 * @param {String} mind -
 */
export async function commit(mind) {
  const dir = await findMind(mind);

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

/**
 * This
 * @name clone
 * @function
 * @param {String} mind -
 * @param {String} name -
 * @param {String} remote -
 */
export async function clone(mind, name, remote) {
  const dir = nameMind(mind, name);

  try {
    await findMind(mind);

    // remove existing directory
    await rimraf(dir);
  } catch {
    // do nothing
  }

  const options = {
    fs,
    http,
    dir,
    url: remote.url,
    singleBranch: true,
  };

  if (remote.token !== undefined) {
    options.onAuth = () => ({
      username: remote.token,
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
    value: remote.url,
  });

  if (remote.token !== undefined) {
    await git.setConfig({
      fs,
      dir,
      path: "remote.origin.token",
      value: remote.token,
    });
  }
}

/**
 * This
 * @name setOrigin
 * @function
 * @param {String} mind -
 * @param {String} remoteUrl -
 * @param {String} remoteToken -
 */
export async function setOrigin(mind, remoteUrl, remoteToken) {
  const dir = await findMind(mind);

  await git.addRemote({
    fs,
    dir,
    remote: "origin",
    url: remoteUrl,
  });

  if (remoteToken !== undefined) {
    await git.setConfig({
      fs,
      dir,
      path: `remote.origin.token`,
      value: remoteToken,
    });
  }
}

/**
 * This
 * @name getOrigin
 * @function
 * @param {String} mind -
 * @returns {object}
 */
export async function getOrigin(mind) {
  const dir = await findMind(mind);

  const remoteUrl = await git.getConfig({
    fs,
    dir,
    path: `remote.origin.url`,
  });

  if (remoteUrl === undefined) throw Error("no remote");

  const remoteToken = await git.getConfig({
    fs,
    dir,
    path: `remote.origin.token`,
  });

  return { url: remoteUrl, token: remoteToken };
}

/**
 * This
 * @name pull
 * @function
 * @param {String} mind -
 * @param {String} remoteUrl -
 * @param {String} remoteToken -
 */
export async function pull(mind, remoteUrl, remoteToken) {
  const dir = await findMind(mind);

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
    remote: "origin",
    ...tokenPartial,
  });
}

/**
 * This
 * @name push
 * @function
 * @param {String} mind -
 * @param {String} remoteUrl -
 * @param {String} remoteToken -
 */
export async function push(mind, remoteUrl, remoteToken) {
  const dir = await findMind(mind);

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
    remote: "origin",
    ...tokenPartial,
  });
}
