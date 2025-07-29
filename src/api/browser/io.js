import { fs } from "@/api/browser/lightningfs.js";

/**
 * This
 * @name findMind
 * @function
 * @param {String} mind -
 * @returns {String}
 */
export async function findMind(mind) {
  const existingMind = (await fs.promises.readdir("/")).find((m) =>
    new RegExp(`^${mind}`).test(m),
  );

  if (existingMind === undefined) {
    throw Error("no mind found");
  } else {
    return `/${existingMind}`;
  }
}

/**
 * This
 * @name fetchFile
 * @function
 * @param {String} mind -
 * @param {String} filepath -
 * @returns {File}
 */
export async function fetchFile(mind, filepath) {
  const dir = await findMind(mind);

  // check if path exists in the mind
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

/**
 * This
 * @name readFile
 * @function
 * @param {String} mind -
 * @param {String} filepath -
 * @returns {String}
 */
export async function readFile(mind, filepath) {
  const file = await fetchFile(mind, filepath);

  const restext = new TextDecoder().decode(file);

  return restext;
}

/**
 * This
 * @name writeFile
 * @function
 * @param {String} mind -
 * @param {String} filepath -
 * @param {String} content -
 */
export async function writeFile(mind, filepath, content) {
  const dir = await findMind(mind);

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

/**
 * This
 * @name rimraf
 * @function
 * @param {String} rimrafpath -
 */
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

/**
 * This
 * @name ls
 * @function
 * @param {String} lspath -
 */
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

/**
 * This
 * @name pickFile
 * @function
 */
export async function pickFile() {
  const input = document.createElement("input");

  input.type = "file";

  input.multiple = "multiple";

  return new Promise((res) => {
    input.onchange = async (e) => {
      res(e.target.files);
    };
  });
}
