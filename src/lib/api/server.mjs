import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { exec } from 'child_process';
import git from 'isomorphic-git';
import { CSVS } from '@fetsorn/csvs-js';
import crypto from 'crypto';

// TODO: add WASM fallback
async function grepCallback(contentFile, patternFile, isInverse) {
  // console.log("grepCallback")

  const contentFilePath = `/tmp/${crypto.randomUUID()}`;

  const patternFilePath = `/tmp/${crypto.randomUUID()}`;

  await fs.promises.writeFile(contentFilePath, contentFile);

  await fs.promises.writeFile(patternFilePath, patternFile);

  let output = '';

  try {
    // console.log(`grep ${contentFile} for ${patternFile}`)
    const { stdout, stderr } = await promisify(exec)(
      'export PATH=$PATH:~/.nix-profile/bin/; '
        + `rg ${isInverse ? '-v' : ''} -f ${patternFilePath} ${contentFilePath}`,
    );

    if (stderr) {
      console.log('grep cli failed', stderr);
    } else {
      output = stdout;
    }
  } catch (e) {
    // console.log('grep cli returned empty', e);
  }

  await fs.promises.unlink(contentFilePath);

  await fs.promises.unlink(patternFilePath);

  return output;
}

export class ServerAPI {
  dir;

  constructor(dir) {
    this.dir = dir;
  }

  async fetchCallback(filepath) {
    const realpath = path.join(this.dir, filepath);

    let contents;

    try {
      contents = await fs.promises.readFile(realpath, { encoding: 'utf8' });

      return contents;
    } catch {
      throw ("couldn't find file", filepath);
    }
  }

  async fetchFile(filepath) {
    const realpath = path.join(this.dir, filepath);

    const content = fs.readFileSync(realpath);

    return content;
  }

  async writeFile(
    filepath,
    content,
  ) {
    // TODO: add try/catch and mkdir in case file doesn't exist
    const realpath = path.join(this.dir, filepath);

    await fs.promises.writeFile(realpath, content);
  }

  async putAsset(filename, buffer) {
    this.writeFile(`lfs/${filename}`, buffer);
  }

  async uploadFile(file) {
    const fileArrayBuffer = fs.readFileSync(file.filepath);

    const hashArrayBuffer = await crypto.webcrypto.subtle.digest(
      'SHA-256',
      fileArrayBuffer,
    );

    const hashByteArray = Array.from(new Uint8Array(hashArrayBuffer));

    const hashHexString = hashByteArray.map((b) => b.toString(16).padStart(2, '0')).join('');

    const uploadDir = path.join(this.dir, 'lfs');

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
      // console.log(`Directory ${root} is created.`);
    } else {
      // console.log(`Directory ${root} already exists.`);
    }

    const uploadPath = path.join(uploadDir, hashHexString);

    await fs.promises.rename(file.filepath, uploadPath);

    return [hashHexString, file.originalFilename];
  }

  async select(searchParams) {
    const overview = await (new CSVS({
      readFile: this.fetchCallback.bind(this),
      grep: grepCallback,
    })).select(searchParams);

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

        [filepath, HEADStatus, workingDirStatus, stageStatus] = await git.statusMatrix({
          fs,
          dir,
          filepaths: [filepath],
        });

        if (HEADStatus === workingDirStatus && workingDirStatus === stageStatus) {
        // eslint-disable-next-line
          continue;
        }
      }

      if (workingDirStatus !== stageStatus) {
        let status;

        if (workingDirStatus === 0) {
          status = 'deleted';

          await git.remove({
            fs,
            dir,
            filepath,
          });
        } else {
        // if file in lfs/ add as LFS
          if (filepath.startsWith('lfs')) {
            const { addLFS } = await import('./lfs.js');

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
            status = 'modified';
          } else {
            status = 'added';
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
          name: 'name',
          email: 'name@mail.com',
        },
        message: message.toString(),
      });
    }
  }
}
