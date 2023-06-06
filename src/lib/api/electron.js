import fs from 'fs';
import path from 'path';
import { URLSearchParams } from 'url';
import { app, dialog } from 'electron';
import git from 'isomorphic-git';
import http from 'isomorphic-git/http/node/index.cjs';
import { exportPDF, generateLatex } from 'lib/latex';
import { Worker } from 'node:worker_threads';

const home = app.getPath('home');

const appdir = ".evenor";

let readWorker;

// we run CSVS functions in workers to offload the main thread
// but UI only expects results from the last call to CSVS.select
// so we want only one instance of worker running at any time
// and we terminate the previous instance if worker is still running
async function runWorker(workerData) {
  if (workerData.msg === 'select' && readWorker !== undefined) {
    await readWorker.terminate();

    readWorker = undefined;
  }

  return new Promise((resolve, reject) => {
    const worker = new Worker(
      new URL('./electron.worker.js', import.meta.url),
      {
        workerData,
      },
    );

    worker.on('message', (message) => {
      if (typeof message === 'string' && message.startsWith('log')) {
        // console.log(message);
      } else {
        if (workerData.msg === 'select') {
          readWorker = undefined;
        }
        resolve(message);
      }
    });

    worker.on('error', reject);

    worker.on('exit', (code) => {
      if (workerData.msg === 'select') {
        readWorker = undefined;
      }
      if (code !== 0) { reject(new Error(`Worker stopped with exit code ${code}`)); }
    });

    if (workerData.msg === 'select') {
      readWorker = worker;
    }
  });
}

export class ElectronAPI {
  uuid;

  dir;

  constructor(uuid) {
    this.uuid = uuid;

    const root = path.join(home, appdir);

    const store = path.join(root, 'store');

    this.dir = path.join(store, uuid);
  }

  async fetchFile(filepath) {
    const realpath = path.join(this.dir, filepath);

    const content = fs.readFileSync(realpath);

    return content;
  }

  async readFile(filepath) {
    const realpath = path.join(this.dir, filepath);

    const content = fs.readFileSync(realpath, { encoding: 'utf8' });

    return content;
  }

  async writeFile(filepath, content) {
    const appdata = path.join(home, appdir);

    const store = path.join(appdata, 'store');

    const realpath = path.join(store, this.uuid, filepath);

    // if path doesn't exist, create it
    // split path into array of directory names
    const pathElements = ['store', this.uuid].concat(filepath.split(path.sep));

    // remove file name
    pathElements.pop();

    let root = '';

    for (let i = 0; i < pathElements.length; i += 1) {
      const pathElement = pathElements[i];

      root += path.sep;

      const files = await fs.promises.readdir(path.join(appdata, root));

      if (!files.includes(pathElement)) {
        try {
          await fs.promises.mkdir(path.join(appdata, root, pathElement));
        } catch {
          // do nothing
        }
      } else {
        // console.log(`${root} has ${pathElement}`)
      }

      root += pathElement;
    }

    await fs.promises.writeFile(realpath, content);
  }

  async putAsset(filename, buffer) {
    // TODO: write buffer to assetEndpoint/filename, if assetEnpoint is writeable
    // this.writeFile(path.join(undefined, filename), buffer);
    console.log("api/electron/putAsset: not implemented");
  }

  async uploadFile() {
    const res = await dialog.showOpenDialog({ properties: ['openFile'] });

    if (res.canceled) {
      throw Error('cancelled');
    } else {
      const filepath = res.filePaths[0];

      const fileArrayBuffer = fs.readFileSync(filepath);

      const crypto = await import('crypto');

      const hashArrayBuffer = await crypto.webcrypto.subtle.digest(
        'SHA-256',
        fileArrayBuffer,
      );

      const hashByteArray = Array.from(new Uint8Array(hashArrayBuffer));

      const hashHexString = hashByteArray.map((b) => b.toString(16).padStart(2, '0')).join('');

      await this.putAsset(hashHexString, fileArrayBuffer);

      return [hashHexString, path.basename(filepath)];
    }
  }

  async select(searchParams) {
    return runWorker({
      msg: 'select',
      dir: this.dir,
      searchParamsString: searchParams.toString(),
    });
  }

  async queryOptions(branch) {
    const searchParams = new URLSearchParams();

    searchParams.set('_', branch);

    return runWorker({
      msg: 'select',
      dir: this.dir,
      searchParamsString: searchParams.toString(),
    });
  }

  async updateEntry(entry, overview) {
    const entryNew = await runWorker({
      msg: 'update',
      uuid: this.uuid,
      dir: this.dir,
      home,
      entry,
    });

    if (overview.find((e) => e.UUID === entryNew.UUID)) {
      return overview.map((e) => {
        if (e.UUID === entryNew.UUID) {
          return entryNew;
        }
        return e;
      });
    }

    return overview.concat([entryNew]);
  }

  async deleteEntry(entry, overview) {
    await runWorker({
      msg: 'delete',
      uuid: this.uuid,
      dir: this.dir,
      home,
      entry,
    });

    return overview.filter((e) => e.UUID !== entry.UUID);
  }

  async clone(remote, token, name) {
    try {
      await fs.promises.access(this.dir);

      throw Error('could not clone, directory exists');
    } catch (e) {
      await this.tbn2(remote, token);

      if (name) {
        await this.symlink(name);
      }
    }
  }

  async tbn2(
    remote,
    token,
  ) {
    const options = {
      fs,
      http,
      dir: this.dir,
      url: remote,
      singleBranch: true,
      // depth: 1,
    };

    if (token) {
      options.onAuth = () => ({
        username: token,
      });
    }

    await git.clone(options);
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
          // TODO: stage files in remoteEndpoint as LFS pointers
          // if (filepath.startsWith(remoteEndpoint)) {
          //   const { addLFS } = await import('./lfs.mjs');

          //   await addLFS({
          //     fs,
          //     dir,
          //     filepath,
          //   });
          // } else {
            await git.add({
              fs,
              dir,
              filepath,
            });
          // }

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

  // called with "files" by dispensers which need to check download acitons
  // called without "files" on push
  async uploadBlobsLFS(url, token, files) {
    const { pointsToLFS, uploadBlobs } = await import('@fetsorn/isogit-lfs');

    let assets;

    // TODO
    // for every file in remoteEndpoint/
    // if file is not LFS pointer,
    // upload file to remote
    // if (files === undefined) {
    //   const filenames = await fs.promises.readdir(`${this.dir}/${remoteEndpoint}/`);

    //   assets = (await Promise.all(
    //     filenames.map(async (filename) => {
    //       const file = await this.fetchFile(path.join(remoteEndpoint, filename));

    //       if (!pointsToLFS(file)) {
    //         return file;
    //       }

    //       return undefined;
    //     }),
    //   )).filter(Boolean);
    // } else {
    //   assets = files;
    // }

    // await uploadBlobs({
    //   url,
    //   auth: {
    //     username: token,
    //     password: token,
    //   },
    // }, assets);

    console.log("api/electron/uploadBlobsLFS: not implemented");
  }

  async push(url, token) {
    try {
      await this.uploadBlobsLFS(url, token);
    } catch (e) {
      console.log('uploadBlobs failed', e);
    }

    await git.push({
      fs,
      http,
      force: true,
      dir: this.dir,
      url,
      onAuth: () => ({
        username: token,
      }),
    });
  }

  async pull(url, token) {
    // fastForward instead of pull
    // https://github.com/isomorphic-git/isomorphic-git/issues/1073
    await git.fastForward({
      fs,
      http,
      dir: this.dir,
      url,
      onAuth: () => ({
        username: token,
      }),
    });
  }

  async addRemote(url) {
    await git.addRemote({
      fs,
      dir: this.dir,
      remote: 'upstream',
      url,
      force: true,
    });
  }

  async ensure(schema, name) {
    await this.setupRepo(schema);

    if (name) {
      await this.symlink(name);
    }
  }

  async setupRepo(schema) {
    const root = path.join(home, appdir);

    if (!(await fs.promises.readdir(home)).includes(appdir)) {
      await fs.promises.mkdir(root);
    }

    const store = path.join(root, 'store');

    if (!(await fs.promises.readdir(root)).includes('store')) {
      await fs.promises.mkdir(store);
    }

    const { dir } = this;

    if (!(await fs.promises.readdir(store)).includes(this.uuid)) {
      await fs.promises.mkdir(dir);

      await git.init({ fs, dir, defaultBranch: 'main' });
    }

    // TODO: ignore remoteEndpoint
    // await fs.promises.writeFile(
    //   `${dir}/.gitattributes`,
    //   '${remoteEndpoint}/** filter=lfs diff=lfs merge=lfs -text\n',
    //   'utf8',
    // );

    // await git.setConfig({
    //   fs,
    //   dir,
    //   path: 'filter.lfs.clean',
    //   value: 'git-lfs clean -- %f',
    // });

    // await git.setConfig({
    //   fs,
    //   dir,
    //   path: 'filter.lfs.smudge',
    //   value: 'git-lfs smudge -- %f',
    // });

    // await git.setConfig({
    //   fs,
    //   dir,
    //   path: 'filter.lfs.process',
    //   value: 'git-lfs filter-process',
    // });

    // await git.setConfig({
    //   fs,
    //   dir,
    //   path: 'filter.lfs.required',
    //   value: true,
    // });

    await fs.promises.writeFile(
      path.join(dir, 'metadir.json'),
      JSON.stringify(schema, null, 2),
      'utf8',
    );

    await this.commit();
  }

  async symlink(name) {
    const root = path.join(home, appdir);

    const repos = path.join(root, 'repos');

    if (!(await fs.promises.readdir(root)).includes('repos')) {
      await fs.promises.mkdir(repos);
    }

    // nt requires admin privilege to symlink
    if (process.platform === 'win32') {
      const { dir } = this;

      const sudo = await import('sudo-prompt-alt');

      await new Promise((res, rej) => {
        sudo.exec(`mklink "${path.join(repos, name)}" "${dir}"`, {}, (error) => {
          if (error) rej(error);

          res();
        });
      });
    } else {
      try {
        await fs.promises.unlink(path.join(repos, name));
      } catch {
        // do nothing
      }

      await fs.promises.symlink(this.dir, path.join(repos, name));
    }
  }

  static async rimraf(rimrafpath) {
    const root = path.join(home, appdir);

    const file = path.join(root, rimrafpath);

    try {
      const stats = await fs.promises.stat(file);

      if (stats.isFile()) {
        await fs.promises.unlink(file);
      } else if (stats.isDirectory()) {
        await fs.promises.rmdir(file, { recursive: true });
      }
    } catch (e) {
      // console.log(`failed to rimraf ${e}`);
    }
  }

  async ls(lspath) {
    let files;

    try {
      files = await fs.promises.readdir(lspath);
    } catch {
      throw Error(`can't read ${lspath} to list it`);
    }

    console.log('list ', lspath, ':', files);

    for (const file of files) {
      const filepath = path.join(lspath, file);

      const { type } = await fs.promises.stat(filepath);

      if (type === 'dir') {
        await this.ls(filepath);
      }
    }
  }

  // fails at parseConfig with "cannot split null",
  // as if it doesn't find the config
  async getRemote() {
    return git.getConfig({
      fs,
      dir: this.dir,
      path: 'remote.origin.url',
    });
  }

  static async latex() {
    const text = generateLatex([]);

    const pdfURL = await exportPDF(text);

    return pdfURL;
  }

  async readSchema() {
    const schemaString = await this.readFile('metadir.json');

    const schema = JSON.parse(schemaString);

    return schema;
  }

  async readGedcom() {
    const gedcom = await this.readFile('index.ged');

    return gedcom;
  }

  async readIndex() {
    const index = await this.readFile('index.html');

    return index;
  }

  async downloadAsset(filename, filehash, token) {
    const content = await this.fetchAsset(filehash, token);

    const file = await dialog.showSaveDialog({
      title: 'Select the File Path to save',
      defaultPath: filename,
      buttonLabel: 'Save',
      filters: [],
      properties: [],
    });

    if (!file.canceled) {
      await fs.promises.writeFile(file.filePath.toString(), content);
    }
  }

  async zip() {
    const { default: JsZip } = await import('jszip');

    const zip = new JsZip();

    const addToZip = async (dir, zipDir) => {
      const files = await fs.promises.readdir(dir);

      for (const filename of files) {
        const filepath = path.join(dir, filename);

        const stats = await fs.promises.lstat(filepath);

        if (stats.isFile()) {
          const content = await fs.promises.readFile(filepath);

          zipDir.file(filename, content);
        } else if (stats.isDirectory()) {
          const zipDirNew = zipDir.folder(filename);

          await addToZip(filepath, zipDirNew);
        }
      }
    };

    await addToZip(this.dir, zip);

    zip.generateAsync({ type: 'nodebuffer' }).then(async (content) => {
      const file = await dialog.showSaveDialog({
        title: 'Select the File Path to save',
        defaultPath: this.uuid,
        buttonLabel: 'Save',
        // Restricting the user to only Text Files.
        filters: [
          {
            name: 'Zip Files',
            extensions: ['zip'],
          }],
        properties: [],
      });

      if (!file.canceled) {
        await fs.promises.writeFile(file.filePath.toString(), content);
      }
    });
  }

  async cloneView(remote, token) {
    try {
      await this.rimraf(this.dir);
    } catch {
      // do nothing
    }

    await this.clone(remote, token);
  }

  // returns blob url
  async fetchAsset(filename, token) {
    // TODO: get file from assetEndpoint
    // let content = await this.fetchFile(path.join(undefined, filename));

    // const { downloadBlobFromPointer, pointsToLFS, readPointer } = await import('@fetsorn/isogit-lfs');

    // if (pointsToLFS(content)) {
    //   const remote = await this.getRemote();

    //   const pointer = await readPointer({ dir: this.dir, content });

    //   content = await downloadBlobFromPointer(
    //     fs,
    //     {
    //       http,
    //       url: remote,
    //       auth: {
    //         username: token,
    //         password: token,
    //       },
    //     },
    //     pointer,
    //   );
    // }

    // return content;
    console.log("api/electron/fetchAsset: not implemented");
  }

  async writeFeed(xml) {
    await this.writeFile('feed.xml', xml);
  }

  static async downloadUrlFromPointer(url, token, pointerInfo) {
    const { downloadUrlFromPointer } = await import('@fetsorn/isogit-lfs');

    return downloadUrlFromPointer(
      {
        http,
        url,
        auth: {
          username: token,
          password: token,
        },
      },
      pointerInfo,
    );
  }
}
