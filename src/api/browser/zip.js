import JsZip from "jszip";
import { saveAs } from "file-saver";
import { fs } from "@/api/browser/lightningfs.js";
import { findMind } from "@/api/browser/io.js";

/**
 * This
 * @name addToZip
 * @function
 * @param {String} dir -
 * @param {object} zipDir -
 */
export async function addToZip(dir, zipDir) {
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
}

/**
 * This
 * @name zip
 * @function
 * @param {String} mind -
 */
export async function zip(mind) {
  const dir = await findMind(mind);

  const zip = new JsZip();

  await addToZip(dir, zip);

  const content = await zip.generateAsync({ type: "blob" });

  saveAs(content, "archive.zip");
}
