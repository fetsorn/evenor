import http from "isomorphic-git/http/web";
import diff3Merge from "diff3";
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
        await fs.promises.rename(existingMind, dir);
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
export async function clone(mind, remote) {
  // if remote is local, rename source to target
  // should be a recursive copy,
  // but don't want to implement it
  if (remote.mind !== undefined) {
    const existingMind = await findMind(remote.mind);

    await fs.promises.rename(existingMind, dir);

    return undefined;
  }

  const pathname = new URL(remote.url).pathname;

  const nameClone = pathname.substring(pathname.lastIndexOf("/") + 1);

  const dir = nameMind(mind, nameClone);

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
    try {
      // if clone failed, remove directory
      await rimraf(dir);
    } catch {
      // do nothing
    }
    console.log(e);
    throw e;
  }

  // if clone is successful, try to set token
  try {
    if (remote.token !== undefined) {
      await git.setConfig({
        fs,
        dir,
        path: "remote.origin.token",
        value: remote.token,
      });
    }
  } catch {
    // do nothing
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
export async function setOrigin(mind, remote) {
  const dir = await findMind(mind);

  const { url: remoteUrl, token: remoteToken } = remote;

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
export async function pull(mind, remote) {
  const dir = await findMind(mind);

  const { url: remoteUrl, token: remoteToken } = remote;

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
export async function push(mind, remote) {
  const dir = await findMind(mind);

  const { url: remoteUrl, token: remoteToken } = remote;

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

const LINEBREAKS = /^.*(\r?\n|$)/gm;

function mergeDriverFactory(conflicts, resolutions) {
  return ({ branches, contents }) => {
    const ourName = branches[1];
    const theirName = branches[2];

    const baseContent = contents[0];
    const ourContent = contents[1];
    const theirContent = contents[2];

    const ours = ourContent.match(LINEBREAKS);
    const base = baseContent.match(LINEBREAKS);
    const theirs = theirContent.match(LINEBREAKS);

    // Here we let the diff3 library do the heavy lifting.
    const result = diff3Merge(ours, base, theirs);

    const markerSize = 7;

    // Here we note whether there are conflicts and format the results
    let mergedText = "";
    let cleanMerge = true;

    for (const item of result) {
      if (item.ok) {
        mergedText += item.ok.join("");
      }

      if (item.conflict) {
        const resolution = resolutions[item.conflict.oIndex];

        if (resolution === undefined) {
          cleanMerge = false;

          conflicts[item.conflict.oIndex] = item.conflict;
        } else {
          mergedText += item.conflict[resolution].join("");
        }
      }
    }

    return { cleanMerge, mergedText };
  };
}

/**
 * This
 * @name sync
 * @function
 * @param {String} mind -
 * @param {String} remoteUrl -
 * @param {String} remoteToken -
 */
export async function sync(mind, remote, resolutions) {
  const dir = await findMind(mind);

  const { url: remoteUrl, token: remoteToken } = remote;

  const tokenPartial = remoteToken
    ? {
        onAuth: () => ({
          username: remoteToken,
        }),
      }
    : {};

  await git.addRemote({
    fs,
    dir,
    remote: "origin",
    url: remote.url,
  });

  await git.fetch({
    fs,
    http,
    dir,
    url: remote.url,
    ref: "HEAD",
    ...tokenPartial,
  });

  let conflicts;

  try {
    // throws if can't merge
    await git.merge({
      fs,
      dir,
      theirs: "origin",
      mergeDriver: mergeDriverFactory(conflicts, resolutions),
    });
  } catch {
    return { ok: false, conflicts };
  }

  await git.push({
    fs,
    http,
    dir,
    url: remoteUrl,
    remote: "origin",
    ...tokenPartial,
  });

  return { ok: true };
}
