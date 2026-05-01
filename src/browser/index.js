import LightningFS from "@isomorphic-git/lightning-fs";
import { initFS } from "./fs.js";
import { initIO } from "./io.js";
import { initDB } from "./db.js";

export default function provider() {
  const fs = initFS(new LightningFS("fs"));

  const io = initIO(fs);

  const db = initDB(fs, io);

  return { ...db, ...io };
}
