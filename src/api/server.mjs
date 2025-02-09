import fs from "fs";
import path from "path";
import { promisify } from "util";
import { exec } from "child_process";
import git from "isomorphic-git";
import csvs from "@fetsorn/csvs-js";
import crypto from "crypto";

const lfsDir = "lfs";

export class ServerAPI {
  dir;

  constructor(dir) {
    this.dir = dir;
  }

  async fetchCallback(filepath) {
    const realpath = path.join(this.dir, filepath);

    let contents;

    try {
      contents = await fs.promises.readFile(realpath, { encoding: "utf8" });

      return contents;
    } catch {
      throw ("couldn't find file", filepath);
    }
  }

  async uploadFile(file) {
    const fileArrayBuffer = fs.readFileSync(file.filepath);

    const hashArrayBuffer = await crypto.webcrypto.subtle.digest(
      "SHA-256",
      fileArrayBuffer,
    );

    const hashByteArray = Array.from(new Uint8Array(hashArrayBuffer));

    const hashHexString = hashByteArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const uploadDir = path.join(this.dir, lfsDir);

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
      console.log(`Directory ${uploadDir} is created.`);
    } else {
      console.log(`Directory ${uploadDir} already exists.`);
    }

    const uploadPath = path.join(uploadDir, hashHexString);

    await fs.promises.rename(file.filepath, uploadPath);

    return [hashHexString, file.originalFilename];
  }

  async select(query) {
    const overview = await csvs.selectRecord({
      fs,
      dir: this.dir,
      query,
    });

    return overview;
  }

  async commit() {
    const { dir } = this;

    const message = [];

    const statusMatrix = await git.statusMatrix({
      fs,
      dir,
    });

    for (let [
      filepath,
      HEADStatus,
      workingDirStatus,
      stageStatus,
    ] of statusMatrix) {
      if (HEADStatus === workingDirStatus && workingDirStatus === stageStatus) {
        await git.resetIndex({
          fs,
          dir,
          filepath,
        });

        [filepath, HEADStatus, workingDirStatus, stageStatus] =
          await git.statusMatrix({
            fs,
            dir,
            filepaths: [filepath],
          });

        if (
          HEADStatus === workingDirStatus &&
          workingDirStatus === stageStatus
        ) {
          // eslint-disable-next-line
          continue;
        }
      }

      if (workingDirStatus !== stageStatus) {
        let status;

        if (workingDirStatus === 0) {
          status = "deleted";

          await git.remove({
            fs,
            dir,
            filepath,
          });
        } else {
          // stage files in remoteEndpoint as LFS pointers
          if (filepath.startsWith(lfsDir)) {
            const { addLFS } = await import("@fetsorn/isogit-lfs");

            await addLFS({
              fs,
              dir,
              filepath,
            });
          } else {
            await git.add({
              fs,
              dir,
              filepath,
            });
          }

          if (HEADStatus === 1) {
            status = "modified";
          } else {
            status = "added";
          }
        }

        message.push(`${filepath} ${status}`);
      }
    }

    if (message.length !== 0) {
      await git.commit({
        fs,
        dir,
        author: {
          name: "name",
          email: "name@mail.com",
        },
        message: message.toString(),
      });
    }
  }
}
