import git from 'isomorphic-git';
import http from 'isomorphic-git/http/web/index.cjs';
import LightningFS from '@isomorphic-git/lightning-fs';
import { CSVS } from '@fetsorn/csvs-js';
import { deepClone } from './curse_controller.js';
import { QueryWorker } from './query_worker.js';

const fs = new LightningFS('fs');

export class BrowserAPI {
  // UUID of repo in the store
  uuid;

  dir;

  constructor(uuid) {
    this.uuid = uuid;

    this.dir = `/store/${uuid}`;
  }

  async readFile(filepath) {
    // eslint-disable-next-line
    if (__BUILD_MODE__ === 'server') {
      return (await fetch(`/api/${filepath}`)).text();
    }

    // check if path exists in the repo
    const pathElements = this.dir.replace(/^\//, '').split('/').concat(filepath.split('/'));
    // console.log('readFile: pathElements, path', pathElements, filepath);

    let root = '';

    const pfs = fs.promises;

    for (let i = 0; i < pathElements.length; i += 1) {
      const pathElement = pathElements[i];

      root += '/';

      const files = await pfs.readdir(root);

      // console.log('readFile: files', root, files);
      if (files.includes(pathElement)) {
        root += pathElement;

        // console.log(`readFile: ${root} has ${pathElement}`);
      } else {
        // console.log(
        //   `Cannot load file. Ensure there is a file called ${pathElement} in ${root}.`,
        // );
        return undefined;
      // throw Error(
      //   `Cannot load file. Ensure there is a file called ${pathElement} in ${root}.`
      // );
      }
    }

    const file = await pfs.readFile(`${this.dir}/${filepath}`);

    const restext = new TextDecoder().decode(file);

    return restext;
  }

  async writeFile(
    filepath,
    content,
  ) {
    // eslint-disable-next-line
    if (__BUILD_MODE__ === 'server') {
      await fetch(`/api/${filepath}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
        }),
      });

      return;
    }
    // if path doesn't exist, create it
    // split path into array of directory names
    const pathElements = this.dir.replace(/^\//, '').split('/').concat(filepath.split('/'));

    // console.log('writeFileBrowser', dir, path, content);

    // remove file name
    pathElements.pop();

    let root = '';

    const pfs = fs.promises;

    for (let i = 0; i < pathElements.length; i += 1) {
      const pathElement = pathElements[i];
      // console.log('writeFileBrowser-path', pathElement)

      root += '/';

      const files = await pfs.readdir(root);

      // console.log(files)

      if (!files.includes(pathElement)) {
      // console.log(`writeFileBrowser creating directory ${pathElement} in ${root}`)

        await pfs.mkdir(`${root}/${pathElement}`);
      } else {
      // console.log(`writeFileBrowser ${root} has ${pathElement}`)
      }

      root += pathElement;
    }

    await pfs.writeFile(`${this.dir}/${filepath}`, content, 'utf8');
  }

  async uploadFile(file) {
    // eslint-disable-next-line
    if (__BUILD_MODE__ === 'server') {
      const form = new FormData();

      form.append('file', file);

      await fetch('/upload', {
        method: 'POST',
        body: form,
      });

      return;
    }

    const pfs = new LightningFS('fs').promises;

    const root = '/';

    const rootFiles = await pfs.readdir('/');

    const repoDir = root + this.uuid;

    if (!rootFiles.includes(this.uuid)) {
      await pfs.mkdir(repoDir);
    }

    const repoFiles = await pfs.readdir(repoDir);

    const local = 'local';

    const localDir = `${repoDir}/${local}`;

    if (!repoFiles.includes(local)) {
      await pfs.mkdir(localDir);
    }

    const localFiles = await pfs.readdir(localDir);

    const filename = file.name;

    const filepath = `${localDir}/${filename}`;

    if (!localFiles.includes(filename)) {
      const buf = await file.arrayBuffer();

      await pfs.writeFile(filepath, buf);
    }
  }

  async select(searchParams) {
    const queryWorker = new QueryWorker(this.readFile.bind(this));

    const overview = await queryWorker.select(searchParams);

    return overview;
  }

  async queryOptions(branch) {
    const searchParams = new URLSearchParams();

    searchParams.set('|', branch);

    const queryWorker = new QueryWorker(this.readFile.bind(this));

    const overview = await queryWorker.select(searchParams);

    return overview;
  }

  async updateEntry(entry, overview) {
    const entryNew = await new CSVS({
      readFile: (filepath) => this.readFile(filepath),
      writeFile: (filepath, content) => this.writeFile(filepath, content),
    }).update(deepClone(entry));

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
    }).delete(deepClone(entry));

    return overview.filter((e) => e.UUID !== entry.UUID);
  }

  async clone(remote, token, name) {
    // TODO add rimraf?

    await this.tbn2(remote, token);

    if (name) {
      await this.symlink(name);
    }
  }

  async tbn2(remote, token) {
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
    // eslint-disable-next-line
    if (__BUILD_MODE__ === 'server') {
      await fetch('api/', {
        method: 'PUT',
      });

      return;
    }

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
      // console.log("commit:", message.toString());
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
    const { dir } = this;

    const name = dir.replace(/^\/store\//, '');

    const pfs = fs.promises;

    if (!(await pfs.readdir('/')).includes('store')) {
      await pfs.mkdir('/store');
    }

    const repoDir = `/store/${name}`;

    if (!(await pfs.readdir('/store')).includes(name)) {
      await pfs.mkdir(repoDir);

      await git.init({ fs, dir: repoDir });
    }

    await pfs.writeFile(`${repoDir}/metadir.json`, schema, 'utf8');

    await this.commit();
  }

  async symlink(name) {
    const pfs = fs.promises;

    if (!(await pfs.readdir('/')).includes('repos')) {
      await pfs.mkdir('/repos');
    }

    await pfs.symlink(this.dir, `/repos/${name}`);
  }

  async rimraf(rimrafpath) {
    const pfs = fs.promises;

    let files;

    try {
      files = await pfs.readdir(rimrafpath);
    } catch {
      throw Error(`can't read ${rimrafpath} to rimraf it`);
    }

    for (const file of files) {
      const filepath = `${rimrafpath}/${file}`;

      const { type } = await pfs.stat(filepath);

      if (type === 'file') {
        await pfs.unlink(filepath);
      } else if (type === 'dir') {
        await this.rimraf(filepath);
      }
    }

    await pfs.rmdir(rimrafpath);
  }

  async ls(lspath) {
    const pfs = fs.promises;

    let files;

    try {
      files = await pfs.readdir(lspath);
    } catch {
      throw Error(`can't read ${lspath} to list it`);
    }

    console.log('list ', lspath, ':', files);

    for (const file of files) {
      const filepath = `${lspath}/${file}`;

      const { type } = await pfs.stat(filepath);

      if (type === 'dir') {
        await this.ls(filepath);
      }
    }
  }

  async readSchema() {
    const schemaString = await this.readFile('metadir.json');

    const schema = JSON.parse(schemaString);

    return schema;
  }
}
