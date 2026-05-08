import JsZip from "jszip";

/**
 * Recursively add directory contents to a JSZip instance.
 * @param {object} fs - filesystem
 * @param {string} dir - directory path
 * @param {object} zipDir - JSZip folder
 */
export async function addToZip(fs, dir, zipDir) {
  const files = await fs.promises.readdir(dir);

  for (const file of files) {
    const filepath = `${dir}/${file}`;

    const { type: filetype } = await fs.promises.lstat(filepath);

    if (filetype === "file") {
      const content = await fs.promises.readFile(filepath);

      zipDir.file(file, content);
    } else if (filetype === "dir") {
      const zipDirNew = zipDir.folder(file);

      await addToZip(fs, filepath, zipDirNew);
    }
  }
}

/**
 * Zip a directory into a blob.
 * @param {object} fs - filesystem
 * @param {string} dir - directory path
 * @returns {Promise<Blob>}
 */
export async function zip(fs, dir) {
  const zip = new JsZip();

  await addToZip(fs, dir, zip);

  const content = await zip.generateAsync({ type: "blob" });

  return content;
}

/**
 * Extract a zip file into a directory on the filesystem.
 * @param {object} fs - filesystem
 * @param {File|Blob} file - zip file
 * @param {string} dir - target directory path
 */
export async function unzip(fs, file, dir) {
  const zip = await JsZip.loadAsync(file);

  // ensure target directory exists
  await fs.promises.mkdir(dir).catch(() => {});

  for (const [relativePath, entry] of Object.entries(zip.files)) {
    const fullPath = `${dir}/${relativePath}`;

    if (entry.dir) {
      await fs.promises.mkdir(fullPath).catch(() => {});
    } else {
      // ensure parent directories exist
      const parts = relativePath.split("/");
      let current = dir;

      for (let i = 0; i < parts.length - 1; i++) {
        current = `${current}/${parts[i]}`;
        await fs.promises.mkdir(current).catch(() => {});
      }

      const content = await entry.async("uint8array");

      await fs.promises.writeFile(fullPath, content);
    }
  }
}
