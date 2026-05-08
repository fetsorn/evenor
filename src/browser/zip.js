import JsZip from "jszip";

/**
 * This
 * @name addToZip
 * @function
 * @param {String} dir -
 * @param {object} zipDir -
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
 * This
 * @name zip
 * @function
 * @param {String} mind -
 */
export async function zip(fs, dir) {
  const zip = new JsZip();

  await addToZip(fs, dir, zip);

  const content = await zip.generateAsync({ type: "blob" });

  return content;
}
