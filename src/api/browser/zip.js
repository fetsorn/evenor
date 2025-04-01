import JsZip from "jszip";
import { saveAs } from "file-saver";

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
