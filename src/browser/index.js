import { saveAs } from "file-saver";
import mindzoo from "@fetsorn/mindzoo";
import { zip, unzip } from "./zip.js";
import { seedDefaultMind } from "@/seed.js";

async function archive({ fs, zoo }, mind) {
  const dir = await zoo.catalog.locate(mind);

  const basename = dir.split("/").pop();

  const content = await zip(fs, dir);

  const timestamp = new Date().toISOString().slice(0, -5);

  saveAs(content, `${timestamp}_${basename}.zip`);
}

function pickFile(accept) {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = accept;
    input.onchange = () => resolve(input.files[0] ?? null);
    input.click();
  });
}

async function restore({ fs, zoo }, mind) {
  const file = await pickFile(".zip");

  if (!file) return;

  const dir = await zoo.catalog.locate(mind);

  await unzip(fs, file, dir);

  await zoo.catalog.rebuild();
}

async function merge({ zoo }, mind, strategy) {
  await zoo.catalog.merge(mind, strategy);
}

export default async (fs, { seed = true } = {}) => {
  console.time("evenor::browser init");

  // seed default mind on first run (before mindzoo rebuild discovers it)
  if (seed) {
    console.log("evenor::browser seed");
    await seedDefaultMind(fs, "/");
  }

  console.log("evenor::browser import http");
  const http = await import("isomorphic-git/http/web");

  console.log("evenor::browser create mindzoo");
  const zoo = await mindzoo({ fs, http, dir: "/" });
  console.timeEnd("evenor::browser init");

  return {
    sparql: zoo.sparql,
    archive: (mind) => archive({ fs, zoo }, mind),
    restore: (mind) => restore({ fs, zoo }, mind),
    merge: (mind, strategy) => merge({ zoo }, mind, strategy),
    computeStats: () => zoo.catalog.computeStats(),
  };
};
