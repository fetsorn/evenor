import http from "isomorphic-git/http/web/index.cjs";
import git from "isomorphic-git";
import lfs from "@fetsorn/isogit-lfs";
import { fs } from "./lightningfs.js";
import { lfsDir } from "./lfs.js";
import { findDir, rimraf } from "./io.js";

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
        // eslint-disable-next-line
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
        // stage files in remoteEndpoint as LFS pointers
        if (filepath.startsWith(lfsDir)) {
          await lfs.addLFS({
            fs,
            dir,
            filepath,
          });
        } else {
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

export async function ensure(uuid, name) {
  const dir = `/${uuid}${name !== undefined ? `-${name}` : ""}`;

  const existingRepo = (await fs.promises.readdir("/")).find((repo) =>
    new RegExp(`^${uuid}`).test(repo),
  );

  if (existingRepo === undefined) {
    await fs.promises.mkdir(dir);

    await git.init({ fs, dir, defaultBranch: "main" });
  } else if (`/${existingRepo}` !== dir) {
    await fs.promises.rename(`/${existingRepo}`, dir);
  }

  await fs.promises.writeFile(`${dir}/.gitignore`, `.DS_Store`, "utf8");

  await fs.promises.writeFile(
    `${dir}/.gitattributes`,
    `${lfsDir}/** filter=lfs diff=lfs merge=lfs -text\n`,
    "utf8",
  );

  try {
    await fs.promises.mkdir(`${dir}/.git`);
  } catch {
    // do nothing
  }

  await fs.promises.writeFile(`${dir}/.git/config`, "\n", "utf8");

  await git.setConfig({
    fs,
    dir,
    path: "filter.lfs.clean",
    value: "git-lfs clean -- %f",
  });

  await git.setConfig({
    fs,
    dir,
    path: "filter.lfs.smudge",
    value: "git-lfs smudge -- %f",
  });

  await git.setConfig({
    fs,
    dir,
    path: "filter.lfs.process",
    value: "git-lfs filter-process",
  });

  await git.setConfig({
    fs,
    dir,
    path: "filter.lfs.required",
    value: true,
  });

  await fs.promises.writeFile(`${dir}/.csvs.csv`, "csvs,0.0.2", "utf8");

  await commit(uuid);
}

export async function clone(uuid, remoteUrl, remoteToken, name) {
  if (
    (await fs.promises.readdir("/")).some((repo) =>
      new RegExp(`^${uuid}`).test(repo),
    )
  ) {
    throw Error(`could not clone, directory ${uuid} exists`);
  }

  const dir = `/${uuid}-${name}`;

  const options = {
    fs,
    http,
    dir,
    url: remoteUrl,
    singleBranch: true,
  };

  if (remoteToken) {
    options.onAuth = () => ({
      username: remoteToken,
    });
  }

  try {
    await git.clone(options);
  } catch (e) {
    // if clone failed, remove directory
    await rimraf(dir);

    throw e;
  }

  await git.setConfig({
    fs,
    dir,
    path: "remote.origin.url",
    value: remoteUrl,
  });

  if (remoteToken) {
    await git.setConfig({
      fs,
      dir,
      path: "remote.origin.token",
      value: remoteToken,
    });
  }
}

export async function pull(uuid, remote) {
  const [remoteUrl, remoteToken] = await getRemote(remote);

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
    remote,
    ...tokenPartial,
  });
}

export async function push(uuid, remote) {
  const [remoteUrl, remoteToken] = await getRemote(remote);

  try {
    await uploadBlobsLFS(remote);
  } catch (e) {
    console.log("api/browser/uploadBlobsLFS failed", e);
  }

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
    remote,
    ...tokenPartial,
  });
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

  if (remoteToken) {
    await git.setConfig({
      fs,
      dir,
      path: `remote.${remoteName}.token`,
      value: remoteToken,
    });
  }
}

export async function getRemote(uuid, remoteName) {
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
