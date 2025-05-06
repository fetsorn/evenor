import lfs from "@fetsorn/isogit-lfs";
import git from "isomorphic-git";
import http from "isomorphic-git/http/web/index.cjs";
import { saveAs } from "file-saver";
import { fs } from "@/api/browser/lightningfs.js";
import { findDir, fetchFile, writeFile, pickFile } from "@/api/browser/io.js";
import { listRemotes, getRemote } from "@/api/browser/git.js";

export const lfsDir = "lfs";

export async function createLFS(uuid) {
  const dir = await findDir(uuid);

  await fs.promises.writeFile(
    `${dir}/.gitattributes`,
    `${lfsDir}/** filter=lfs diff=lfs merge=lfs -text\n`,
    "utf8",
  );

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
}

export async function addLFS(dir, filepath) {
  if (filepath.startsWith(lfsDir)) {
    // stage files in remoteEndpoint as LFS pointers
    await lfs.addLFS({
      fs,
      dir,
      filepath,
    });
  } else {
    throw Error("not lfs filepath");
  }
}

export async function downloadUrlFromPointer(url, token, pointerInfo) {
  return lfs.downloadUrlFromPointer({
    http,
    url,
    auth: {
      username: token,
      password: token,
    },
    info: pointerInfo,
  });
}

export async function addAssetPath(uuid, assetPath) {
  const dir = await findDir(uuid);

  await git.setConfig({
    fs,
    dir,
    path: "asset.path",
    value: assetPath,
  });
}

export async function listAssetPaths(uuid) {
  const dir = await findDir(uuid);

  return git.getConfigAll({
    fs,
    dir,
    path: "asset.path",
  });
}

export async function putAsset(uuid, filename, content) {
  // write buffer to assetEndpoint/filename
  const assetEndpoint = `${lfsDir}/${filename}`;

  await writeFile(uuid, assetEndpoint, content);
}

export function downloadAsset(content, filename) {
  saveAs(content, filename);
}

// returns Uint8Array file contents
export async function fetchAsset(uuid, filename) {
  let assetEndpoint;

  let content;

  const dir = await findDir(uuid);

  try {
    assetEndpoint = await git.getConfig({
      fs,
      dir,
      path: "asset.path",
    });

    if (assetEndpoint) {
      const assetPath = `${assetEndpoint}/${filename}`;

      // if URL, try to fetch
      try {
        new URL(assetPath);

        content = await fetch(assetPath);

        return content;
      } catch {
        // do nothing
      }

      // otherwise try to read from fs
      content = await fs.promises.readFile(assetPath);

      return content;
    }
  } catch {
    // do nothing
  }

  assetEndpoint = `${dir}/${lfsDir}`;

  const assetPath = `${assetEndpoint}/${filename}`;

  content = await fs.promises.readFile(assetPath);

  const contentUTF8 = new TextDecoder().decode(content);

  if (lfs.pointsToLFS(contentUTF8)) {
    const pointer = await lfs.readPointer({ dir, content: contentUTF8 });

    const remotes = await listRemotes(uuid);

    // loop over remotes trying to resolve LFS
    for (const remote of remotes) {
      const [remoteUrl, remoteToken] = await getRemote(uuid, remote);

      try {
        content = await lfs.downloadBlobFromPointer({
          fs,
          http,
          url: remoteUrl,
          auth: {
            username: remoteToken,
            password: remoteToken,
          },
          pointer,
        });

        return content;
      } catch {
        // do nothing
      }
    }
  }

  return content;
}

// called without "files" on push
export async function uploadBlobsLFS(uuid, remoteUrl, remoteToken, files) {
  const dir = await findDir(uuid);

  let assets;

  // if no files are specified
  // for every file in remoteEndpoint/
  // if file is not LFS pointer,
  // upload file to remote
  if (files === undefined) {
    const filenames = await fs.promises.readdir(`${dir}/${lfsDir}/`);

    assets = (
      await Promise.all(
        filenames.map(async (filename) => {
          const file = await fetchFile(uuid, `${lfsDir}/${filename}`);

          if (!lfs.pointsToLFS(file)) {
            return file;
          }

          return undefined;
        }),
      )
    ).filter(Boolean);
  } else {
    assets = files;
  }

  await lfs.uploadBlobs(
    {
      url: remoteUrl,
      auth: {
        username: remoteToken,
        password: remoteToken,
      },
    },
    assets,
  );
}

// pick file, write file and return metadata
export async function uploadFile(uuid) {
  let metadata = [];

  const files = await pickFile();

  for (const file of files) {
    const fileArrayBuffer = await file.arrayBuffer();

    const hashArrayBuffer = await crypto.subtle.digest(
      "SHA-256",
      fileArrayBuffer,
    );

    const hashByteArray = Array.from(new Uint8Array(hashArrayBuffer));

    const hashHexString = hashByteArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const name = file.name.replace(/\.[^/.]+$/, "");

    const extension = /(?:\.([^.]+))?$/.exec(file.name)[1]?.trim();

    const assetname =
      extension !== undefined ? `${hashHexString}.${extension}` : hashHexString;

    await putAsset(uuid, assetname, fileArrayBuffer);

    const metadatum = { hash: hashHexString, name, extension };

    metadata.push(metadatum);
  }

  return metadata;
}
