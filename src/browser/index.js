import { saveAs } from "file-saver";
import mindzoo from "@fetsorn/mindzoo";
import { zip } from "./zip.js";

async function archive({ fs, zoo }, mind) {
  const dir = await zoo.catalog.locate(mind);

  const content = await zip(fs, dir);

  const timestamp = new Date().toISOString().slice(0, -5);

  saveAs(content, `${timestamp}_${mind}.zip`);
}

export default async (fs) => {
  const zoo = await mindzoo({ fs, dir: "/" });

  return {
    sparql: zoo.sparql,
    archive: (mind) => archive({ fs, zoo }, mind),
  };
};
