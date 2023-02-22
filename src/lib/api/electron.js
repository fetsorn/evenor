import fs from 'fs';
import path from 'path';
import { URLSearchParams } from 'url';
import { app, dialog } from 'electron';
import git from 'isomorphic-git';
import http from 'isomorphic-git/http/node/index.cjs';
import { exportPDF, generateLatex } from 'lib/latex';
import { CSVS } from '@fetsorn/csvs-js';
import crypto from 'crypto';

const home = app.getPath('home');

async function grep(contentFile, patternFile, isInverted) {
  const wasm = await import('@fetsorn/wasm-grep');

  const contents = await wasm.grep(
    contentFile,
    patternFile,
    isInverted ?? false,
  );

  return contents;
}

export class ElectronAPI {
  uuid;

  dir;

  constructor(uuid) {
    this.uuid = uuid;

    const root = path.join(home, '.qualia');

    const store = path.join(root, 'store');

    this.dir = path.join(store, uuid);
  }

  async readFile(
    filepath,
  ) {
    const file = path.join(this.dir, filepath);

    const content = fs.readFileSync(file, { encoding: 'utf8' });

    return content;
  }

  async writeFile(
    filepath,
    content,
  ) {
    const appdata = path.join(home, '.qualia');

    const store = path.join(appdata, 'store');

    const file = path.join(store, this.uuid, filepath);

    // if path doesn't exist, create it
    // split path into array of directory names
    const pathElements = ['store', this.uuid].concat(filepath.split('/'));

    // remove file name
    pathElements.pop();

    let root = '';

    for (let i = 0; i < pathElements.length; i += 1) {
      const pathElement = pathElements[i];

      root += '/';

      const files = await fs.promises.readdir(path.join(appdata, root));

      if (!files.includes(pathElement)) {
        // console.log(`creating directory ${pathElement} in ${root}`)
        await fs.promises.mkdir(path.join(appdata, root, pathElement));
      } else {
        // console.log(`${root} has ${pathElement}`)
      }

      root += pathElement;
    }

    await fs.promises.writeFile(file, content);
  }

  static async uploadFile() {
    const res = await dialog.showOpenDialog({ properties: ['openFile'] });

    if (res.canceled) {
      throw Error('cancelled');
    } else {
      const pathSource = res.filePaths[0];

      const filename = pathSource.substring(pathSource.lastIndexOf('/') + 1);

      const rootPath = path.join(home, '.qualia');

      const localDir = 'local';

      const localPath = path.join(rootPath, this.dir, localDir);

      if (!fs.existsSync(localPath)) {
        fs.mkdirSync(localPath);

        // console.log(`Directory ${root} is created.`);
      } else {
        // console.log(`Directory ${root} already exists.`);
      }

      const destinationPath = path.join(localPath, filename);

      // copy file to local/

      if (!fs.existsSync(destinationPath)) {
        await fs.promises.copyFile(pathSource, destinationPath);

        // console.log(`Directory ${root} is created.`);
      } else {
        // throw `file ${destinationPath} already exists`;
      }

      // return the path to local/filename

      return filename;
    }
  }

  async select(searchParams) {
    // TODO spawn worker thread
    return (new CSVS({
      readFile: this.readFile.bind(this),
      randomUUID: crypto.randomUUID,
      grep,
    })).select(searchParams);
  }

  async queryOptions(branch) {
    // TODO spawn worker thread
    const searchParams = new URLSearchParams();

    searchParams.set('|', branch);

    return (new CSVS({
      readFile: this.readFile.bind(this),
      randomUUID: crypto.randomUUID,
      grep,
    })).select(searchParams);
  }

  async updateEntry(entry, overview) {
    const entryNew = await new CSVS({
      readFile: (filepath) => this.readFile(filepath),
      writeFile: (filepath, content) => this.writeFile(filepath, content),
      randomUUID: crypto.randomUUID,
      grep,
    }).update(entry);

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
    await new CSVS({
      readFile: (filepath) => this.readFile(filepath),
      writeFile: (filepath, content) => this.writeFile(filepath, content),
      randomUUID: crypto.randomUUID,
      grep,
    }).delete(entry);

    return overview.filter((e) => e.UUID !== entry.UUID);
  }

  async clone(remote, token, name) {
    // TODO add rimraf?

    await this.tbn2(remote, token);

    if (name) {
      await this.symlink(name);
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
      depth: 1,
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
      filePath,
      HEADStatus,
      workingDirStatus,
      stageStatus,
    ] of statusMatrix) {
      if (HEADStatus === workingDirStatus && workingDirStatus === stageStatus) {
        await git.resetIndex({
          fs,
          dir,
          filepath: filePath,
        });

        [filePath, HEADStatus, workingDirStatus, stageStatus] = await git.statusMatrix({
          fs,
          dir,
          filepaths: [filePath],
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
            filepath: filePath,
          });
        } else {
          await git.add({
            fs,
            dir,
            filepath: filePath,
          });

          if (HEADStatus === 1) {
            status = 'modified';
          } else {
            status = 'added';
          }
        }

        message.push(`${filePath} ${status}`);
      }
    }

    if (message.length !== 0) {
      console.log('commit:', message.toString());

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

  async push(remote, token) {
    await this.addRemote(remote);

    await this.tbn3(token);
  }

  async tbn3(token) {
    await git.push({
      fs,
      http,
      force: true,
      dir: this.dir,
      remote: 'upstream',
      onAuth: () => ({
        username: token,
      }),
    });
  }

  async pull(remote, token) {
    await this.addRemote(remote);

    await this.fastForward(token);
  }

  async fastForward(token) {
    // fastForward instead of pull
    // https://github.com/isomorphic-git/isomorphic-git/issues/1073
    await git.fastForward({
      fs,
      http,
      dir: this.dir,
      remote: 'upstream',
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
    await this.tbn1(schema);

    if (name) {
      await this.symlink(name);
    }
  }

  async tbn1(schema) {
    const root = path.join(home, '.qualia');

    if (!(await fs.promises.readdir(home)).includes('.qualia')) {
      await fs.promises.mkdir(root);
    }

    const store = path.join(root, 'store');

    if (!(await fs.promises.readdir(root)).includes('store')) {
      await fs.promises.mkdir(store);
    }

    const { dir } = this;

    if (!(await fs.promises.readdir(store)).includes(this.uuid)) {
      await fs.promises.mkdir(dir);

      await git.init({ fs, dir });
    }

    await fs.promises.writeFile(`${dir}/metadir.json`, schema, 'utf8');

    await this.commit();
  }

  async symlink(name) {
    const root = path.join(home, '.qualia');

    const repos = path.join(root, 'repos');

    if (!(await fs.promises.readdir(root)).includes('repos')) {
      await fs.promises.mkdir(repos);
    }

    await fs.promises.unlink(`${repos}/${name}`);

    await fs.promises.symlink(this.dir, `${repos}/${name}`);
  }

  static async rimraf(rimrafpath) {
    const root = path.join(home, '.qualia');

    const file = path.join(root, rimrafpath);

    try {
      const stats = await fs.promises.stat(file);

      if (stats.isFile()) {
        await fs.promises.unlink(file);
      } else if (stats.isDirectory()) {
        await fs.promises.rmdir(file, { recursive: true });
      }
    } catch (e) {
      console.log(`failed to rimraf ${e}`);
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
      const filepath = `${lspath}/${file}`;

      const { type } = await fs.promises.stat(filepath);

      if (type === 'dir') {
        await this.ls(filepath);
      }
    }
  }

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

  // returns ArrayBuffer
  async fetchAsset(
    filepath,
  ) {
    const file = path.join(this.dir, filepath);

    const b = fs.readFileSync(file);

    // ArrayBuffer
    const content = b.buffer.slice(
      b.byteOffset,
      b.byteOffset + b.byteLength,
    );

    return content;
  }

  async readSchema() {
    const schemaString = await this.readFile('metadir.json');

    const schema = JSON.parse(schemaString);

    return schema;
  }

  async zip() {
    const { default: JsZip } = await import('jszip');

    const zip = new JsZip();

    const foo = async (dir, zipDir) => {
      const files = await fs.promises.readdir(dir);

      for (const file of files) {
        const filepath = `${dir}/${file}`;

        const { type: filetype } = await fs.promises.stat(filepath);

        if (filetype === 'file') {
          const content = await fs.promises.readFile(filepath);

          zipDir.file(file, content);
        } else if (filetype === 'dir') {
          const zipDirNew = zipDir.folder(file);

          foo(filepath, zipDirNew);
        }
      }
    };

    await foo(this.dir, zip);

    zip.generateAsync({ type: 'blob' }).then(async (content) => {
      const file = await dialog.showSaveDialog({
        title: 'Select the File Path to save',
        // defaultPath: path.join(__dirname, '../assets/'),
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
}
