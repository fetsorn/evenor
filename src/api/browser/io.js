import git from "isomorphic-git";
import JsZip from "jszip";
import { saveAs } from "file-saver";
import { fs } from "./lightningfs.js";

export async function findDir(uuid) {
  return `/${(await fs.promises.readdir("/")).find((repo) =>
    new RegExp(`^${uuid}`).test(repo),
  )}`;
}

export async function fetchFile(uuid, filepath) {
  const dir = await findDir(uuid);

  // check if path exists in the repo
  const pathElements = dir
    .replace(/^\//, "")
    .split("/")
    .concat(filepath.split("/"));

  let root = "";

  for (let i = 0; i < pathElements.length; i += 1) {
    const pathElement = pathElements[i];

    root += "/";

    const files = await fs.promises.readdir(root);

    if (files.includes(pathElement)) {
      root += pathElement;
    } else {
      // console.log(
      //   `Cannot load file. Ensure there is a file called ${pathElement} in ${root}.`,
      // );
      // throw Error(
      //   `Cannot load file. Ensure there is a file called ${pathElement} in ${root}.`
      // );
      return undefined;
    }
  }

  const file = await fs.promises.readFile(`${dir}/${filepath}`);

  return file;
}

export async function readFile(uuid, filepath) {
  const file = await fetchFile(uuid, filepath);

  const restext = new TextDecoder().decode(file);

  return restext;
}

export async function writeFile(uuid, filepath, content) {
  const dir = await findDir(uuid);

  // if path doesn't exist, create it
  // split path into array of directory names
  const pathElements = dir
    .replace(/^\//, "")
    .split("/")
    .concat(filepath.split("/"));

  // remove file name
  pathElements.pop();

  let root = "";

  for (let i = 0; i < pathElements.length; i += 1) {
    const pathElement = pathElements[i];

    root += "/";

    const files = await fs.promises.readdir(root);

    if (!files.includes(pathElement)) {
      // try/catch because csvs can call this in parallel and fail with EEXIST
      try {
        await fs.promises.mkdir(`${root}/${pathElement}`);
      } catch {
        // do nothing
      }
    } else {
      // console.log(`writeFileBrowser ${root} has ${pathElement}`)
    }

    root += pathElement;
  }

  await fs.promises.writeFile(`${dir}/${filepath}`, content, "utf8");
}

export async function rimraf(uuid, rimrafpath) {
  let files;

  try {
    files = await fs.promises.readdir(rimrafpath);
  } catch {
    throw Error(`can't read ${rimrafpath} to rimraf it`);
  }

  for (const file of files) {
    const filepath = `${rimrafpath}/${file}`;

    const { type } = await fs.promises.stat(filepath);

    if (type === "file") {
      await fs.promises.unlink(filepath);
    } else if (type === "dir") {
      await rimraf(filepath);
    }
  }

  await fs.promises.rmdir(rimrafpath);
}

export async function ls(uuid, lspath) {
  let files;

  try {
    files = await fs.promises.readdir(lspath);
  } catch {
    throw Error(`can't read ${lspath} to list it`);
  }

  console.log("list ", lspath, ":", files);

  for (const file of files) {
    const filepath = `${lspath}/${file}`;

    const { type } = await fs.promises.stat(filepath);

    if (type === "dir") {
      await ls(filepath);
    }
  }
}

export async function zip() {
  const zip = new JsZip();

  const addToZip = async (dir, zipDir) => {
    const files = await fs.promises.readdir(dir);

    for (const file of files) {
      const filepath = `${dir}/${file}`;

      const { type: filetype } = await fs.promises.lstat(filepath);

      if (filetype === "file") {
        const content = await fs.promises.readFile(filepath);

        zipDir.file(file, content);
      } else if (filetype === "dir") {
        const zipDirNew = zipDir.folder(file);

        await addToZip(filepath, zipDirNew);
      }
    }
  };

  const dir = await findDir(uuid);

  await addToZip(dir, zip);

  zip.generateAsync({ type: "blob" }).then((content) => {
    saveAs(content, "archive.zip");
  });
}
