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
 * @name rename
 * @function
 * @param {String} source -
 * @param {String} target -
 */
export async function rename(source, target) {
  // should be a recursive copy,
  // but don't want to implement it
  const existingMind = await findMind(source);

  const dir = nameMind(target);

  await fs.promises.rename(existingMind, dir);

  return undefined;
}

/**
 * This
 * @name clone
 * @function
 * @param {String} mind -
 * @param {String} remote -
 */
export async function clone(mind, remote) {
  const dir = nameMind(mind, undefined);

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
  } catch(e) {
    try {
      // if clone failed, remove directory
      await rimraf(dir);
    } catch(e1) {
      // do nothing
    }
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
 * @param {Object} remote -
 */
export async function setOrigin(mind, remote) {
  const dir = await findMind(mind);

  await git.addRemote({
    fs,
    dir,
    remote: "origin",
    url: remote.url,
    force: true, // overwrite existing origin
  });

  if (remote.token !== undefined) {
    await git.setConfig({
      fs,
      dir,
      path: `remote.origin.token`,
      value: remote.token,
      force: true,
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

  const url = await git.getConfig({
    fs,
    dir,
    path: `remote.origin.url`,
  });

  if (url === undefined) throw Error("no remote");

  const token = await git.getConfig({
    fs,
    dir,
    path: `remote.origin.token`,
  });

  return { url, token };
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
 * @param {Object} remote -
 * @param {Object} resolutions -
 */
export async function resolve(mind, remote, resolutions) {
  const dir = await findMind(mind);

  // soft-serve uses "token ${remote.token}". first word CAN be Token
  // gitea uses "token ${remote.token}". first word MUST be lower-case "token"
  const tokenPartial = remote.token
    ? {
        onAuth: () => ({
          headers: {
            Authorization: `token ${remote.token}`,
          },
        }),
      }
    : {};

  await git.addRemote({
    fs,
    dir,
    remote: "origin",
    url: remote.url,
    force: true,
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
    // TODO collect hunks to conflicts
    // throws if can't merge
    const r = await git.merge({
      fs,
      dir,
      theirs: "origin/main",
      //mergeDriver: mergeDriverFactory(conflicts, resolutions),
      author: {
        name: "evenor",
        email: "evenor@norcivilianlabs.org",
      },
    });

    if (r.alreadyMerged === true) {
      //do nothing
    } else if (r.fastForward === true) {
      // checkout main after fastForward
      await git.checkout({
        fs,
        dir,
        force: true,
      });
    } else {
      await git.add({
        fs,
        dir,
        filepath: ".",
      });

      await git.commit({
        fs,
        dir,
        ref: "main",
        message: "Merge origin into main",
        parent: ["main", "origin/main"], // Be sure to specify the parents when creating a merge commit
      });
    }
  } catch (e) {
    console.log("merge", e);

    return { ok: false, conflicts };
  }

  try {
    await git.push({
      fs,
      http,
      dir,
      url: remote.url,
      remote: "origin",
      ...tokenPartial,
    });
  } catch (e) {
    console.log("push", e);

    return { ok: false, conflicts };
  }

  return { ok: true };
}
