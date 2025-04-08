import JsZip from "jszip";
import { saveAs } from "file-saver";
import { fs } from "./lightningfs.js";
import { findDir } from "./io.js";

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

export async function zip(uuid) {
  const zip = new JsZip();

  const dir = await findDir(uuid);

  await addToZip(dir, zip);

  const content = await zip.generateAsync({ type: "blob" });

  saveAs(content, "archive.zip");
}
