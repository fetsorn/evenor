import LightningFS from "@isomorphic-git/lightning-fs";
import mindbook from "@fetsorn/mindbook";
import { initFS } from "./fs.js";
import { initIO } from "./io.js";
import { initDB } from "./db.js";

export default async function startEvenor() {
  const fs = initFS(new LightningFS("fs"));

  const io = initIO(fs);

  const db = initDB(fs, io);

  await mindbook({
    ...db,
    ...io,
  });
}
