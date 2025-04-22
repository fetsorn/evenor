import git from "isomorphic-git";
import { fs } from "@/api/browser/lightningfs.js";

export async function findDir(uuid) {
  const existingRepo = (await fs.promises.readdir("/")).find((repo) =>
    new RegExp(`^${uuid}`).test(repo),
  );

  if (existingRepo === undefined) {
    throw Error("no repo found");
  } else {
    return `/${existingRepo}`;
  }
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
      //   `Cannot load file. Make sure there is a file called ${pathElement} in ${root}.`,
      // );
      // throw Error(
      //   `Cannot load file. Make sure there is a file called ${pathElement} in ${root}.`
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

export async function rimraf(rimrafpath) {
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

export async function ls(lspath) {
  let files;

  try {
    files = await fs.promises.readdir(lspath);
  } catch {
    throw Error(`can't read ${lspath} to list it`);
  }

  let message = "";

  message += `list ${lspath}: ${files}\n`;

  for (const file of files) {
    const filepath = `${lspath}/${file}`;

    const { type } = await fs.promises.stat(filepath);

    if (type === "dir") {
      message += await ls(filepath);
    }
  }

  return message;
}

export async function pickFile() {
  const input = document.createElement("input");

  input.type = "file";

  input.multiple = "multiple";

  return new Promise((res, rej) => {
    input.onchange = async (e) => {
      res(e.target.files);
    };
  });
}
