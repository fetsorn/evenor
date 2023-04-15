import LightningFS from '@isomorphic-git/lightning-fs';

const fs = new LightningFS('fs');

async function runWorker(readFile, searchParams) {
  const worker = new Worker(new URL('./browser.worker', import.meta.url));

  worker.onmessage = async (message) => {
    switch (message.data.action) {
      case 'readFile': {
        try {
          const contents = await readFile(message.data.filepath);

          message.ports[0].postMessage({ result: contents });
        } catch (e) {
          // safari cannot clone the error object, force to string
          message.ports[0].postMessage({ error: `${e}` });
        }

        break;
      }

      default:
        // do nothing
    }
  };

  // eslint-disable-next-line
  switch (__BUILD_MODE__) {
    case 'server': {
      const response = await fetch(`/query?${searchParams.toString()}`);

      return response.json();
    }

    default: {
      return new Promise((res, rej) => {
        const channel = new MessageChannel();

        channel.port1.onmessage = ({ data }) => {
          channel.port1.close();

          if (data.error) {
            rej(data.error);
          } else {
            res(data.result);
          }
        };

        worker.postMessage(
          { action: 'select', searchParams: searchParams.toString() },
          [channel.port2],
        );
      });
    }
  }
}

export class BrowserAPI {
  // UUID of repo in the store
  uuid;

  dir;

  constructor(uuid) {
    this.uuid = uuid;

    this.dir = `/store/${uuid}`;
  }

  async fetchFile(filepath) {
    // eslint-disable-next-line
    if (__BUILD_MODE__ === 'server') {
      return (await fetch(`/api/${filepath}`)).arrayBuffer();
    }

    // check if path exists in the repo
    const pathElements = this.dir.replace(/^\//, '').split('/').concat(filepath.split('/'));

    let root = '';

    const pfs = fs.promises;

    for (let i = 0; i < pathElements.length; i += 1) {
      const pathElement = pathElements[i];

      root += '/';

      const files = await pfs.readdir(root);

      if (files.includes(pathElement)) {
        root += pathElement;
      } else {
        // console.log(
        //   `Cannot load file. Ensure there is a file called ${pathElement} in ${root}.`,
        // );
        // throw Error(
        //   `Cannot load file. Ensure there is a file called ${pathElement} in ${root}.`
        // );
        return undefined;
      }
    }

    const file = await pfs.readFile(`${this.dir}/${filepath}`);

    return file;
  }

  async readFile(filepath) {
    const file = await this.fetchFile(filepath);

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

    // remove file name
    pathElements.pop();

    let root = '';

    const pfs = fs.promises;

    for (let i = 0; i < pathElements.length; i += 1) {
      const pathElement = pathElements[i];

      root += '/';

      const files = await pfs.readdir(root);

      if (!files.includes(pathElement)) {
        // try/catch because csvs can call this in parallel and fail with EEXIST
        try {
          await pfs.mkdir(`${root}/${pathElement}`);
        } catch {
          // do nothing
        }
      } else {
        // console.log(`writeFileBrowser ${root} has ${pathElement}`)
      }

      root += pathElement;
    }

    await pfs.writeFile(`${this.dir}/${filepath}`, content, 'utf8');
  }

  async putAsset(filename, buffer) {
    this.writeFile(`lfs/${filename}`, buffer);
  }

  async uploadFile(file) {
    // eslint-disable-next-line
    if (__BUILD_MODE__ === 'server') {
      const form = new FormData();

      form.append('file', file);

      const response = await fetch('/upload', {
        method: 'POST',
        body: form,
      });

      const [hashHexString, filename] = JSON.parse(await response.text());

      return [hashHexString, filename];
    }

    const fileArrayBuffer = await file.arrayBuffer();

    const hashArrayBuffer = await crypto.subtle.digest(
      'SHA-256',
      fileArrayBuffer,
    );

    const hashByteArray = Array.from(new Uint8Array(hashArrayBuffer));

    const hashHexString = hashByteArray.map((b) => b.toString(16).padStart(2, '0')).join('');

    await this.putAsset(hashHexString, fileArrayBuffer);

    return [hashHexString, file.name];
  }

  async select(searchParams) {
    const overview = await runWorker(this.readFile.bind(this), searchParams);

    return overview;
  }

  async queryOptions(branch) {
    const searchParams = new URLSearchParams();

    searchParams.set('_', branch);

    const overview = await runWorker(this.readFile.bind(this), searchParams);

    return overview;
  }

  async updateEntry(entry, overview) {
    const { CSVS } = await import('@fetsorn/csvs-js');

    const { deepClone } = await import('./curse_controller.js');

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
    const { CSVS } = await import('@fetsorn/csvs-js');

    const { deepClone } = await import('./curse_controller.js');

    await new CSVS({
      readFile: (filepath) => this.readFile(filepath),
      writeFile: (filepath, content) => this.writeFile(filepath, content),
    }).delete(deepClone(entry));

    return overview.filter((e) => e.UUID !== entry.UUID);
  }

  async clone(remote, token, name) {
    try {
      await fs.promises.stat(this.dir);

      throw Error('could not clone, directory exists');
    } catch (e) {
      await this.tbn2(remote, token);

      if (name) {
        await this.symlink(name);
      }
    }
  }

  async tbn2(url, token) {
    const http = await import('isomorphic-git/http/web/index.cjs');

    const options = {
      fs,
      http,
      dir: this.dir,
      url,
      singleBranch: true,
      // depth: 1,
    };

    if (token) {
      options.onAuth = () => ({
        username: token,
      });
    }

    const { clone } = await import('isomorphic-git');

    await clone(options);
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

    const {
      statusMatrix, resetIndex, remove, add, commit,
    } = await import('isomorphic-git');

    const matrix = await statusMatrix({
      fs,
      dir,
    });

    for (let [
      filepath,
      HEADStatus,
      workingDirStatus,
      stageStatus,
    ] of matrix) {
      if (HEADStatus === workingDirStatus && workingDirStatus === stageStatus) {
        await resetIndex({
          fs,
          dir,
          filepath,
        });

        [filepath, HEADStatus, workingDirStatus, stageStatus] = await statusMatrix({
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

          await remove({
            fs,
            dir,
            filepath,
          });
        } else {
          if (filepath.startsWith('lfs/')) {
            const { addLFS } = await import('./lfs.mjs');

            await addLFS({
              fs,
              dir,
              filepath,
            });
          } else {
            await add({
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
      await commit({
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

  async uploadBlobs(url, token) {
    // for every file in lfs/
    // if file is not LFS pointer,
    // upload file to remote
    const { pointsToLFS, uploadBlobs } = await import('@fetsorn/isogit-lfs');

    const lfs = `${this.dir}/lfs/`;

    const filenames = await fs.promises.readdir(lfs);

    const files = (await Promise.all(
      filenames.map(async (filename) => {
        const file = await this.fetchFile(`lfs/${filename}`);

        if (!pointsToLFS(file)) {
          return file;
        }

        return undefined;
      }),
    )).filter(Boolean);

    await uploadBlobs({
      url,
      auth: {
        username: token,
        password: token,
      },
    }, files);
  }

  async push(url, token) {
    try {
      await this.uploadBlobs(url, token);
    } catch (e) {
      console.log('uploadBlobs failed', e);
    }

    const { push } = await import('isomorphic-git');

    const http = await import('isomorphic-git/http/web/index.cjs');

    await push({
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
    const { fastForward } = await import('isomorphic-git');

    const http = await import('isomorphic-git/http/web/index.cjs');

    await fastForward({
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
    const { addRemote } = await import('isomorphic-git');

    await addRemote({
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
    const pfs = fs.promises;

    if (!(await pfs.readdir('/')).includes('store')) {
      await pfs.mkdir('/store');
    }

    const { dir } = this;

    const { init, setConfig } = await import('isomorphic-git');

    if (!(await pfs.readdir('/store')).includes(this.uuid)) {
      await pfs.mkdir(dir);

      await init({ fs, dir });
    }

    await fs.promises.writeFile(
      `${dir}/.gitattributes`,
      'lfs/** filter=lfs diff=lfs merge=lfs -text\n',
      'utf8',
    );

    await setConfig({
      fs,
      dir,
      path: 'filter.lfs.clean',
      value: 'git-lfs clean -- %f',
    });

    await setConfig({
      fs,
      dir,
      path: 'filter.lfs.smudge',
      value: 'git-lfs smudge -- %f',
    });

    await setConfig({
      fs,
      dir,
      path: 'filter.lfs.process',
      value: 'git-lfs filter-process',
    });

    await setConfig({
      fs,
      dir,
      path: 'filter.lfs.required',
      value: true,
    });

    await pfs.writeFile(`${this.dir}/metadir.json`, JSON.stringify(schema, null, 2), 'utf8');

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

  async readGedcom() {
    const gedcom = await this.readFile('index.ged');

    return gedcom;
  }

  async readIndex() {
    const index = await this.readFile('index.html');

    return index;
  }

  async downloadAsset(filename, filehash, token) {
    const content = this.fetchAsset(filehash, token);

    const { saveAs } = await import('file-saver');

    await saveAs(content, filename);
  }

  async zip() {
    const { default: JsZip } = await import('jszip');

    const zip = new JsZip();

    const addToZip = async (dir, zipDir) => {
      const files = await fs.promises.readdir(dir);

      for (const file of files) {
        const filepath = `${dir}/${file}`;

        const { type: filetype } = await fs.promises.lstat(filepath);

        if (filetype === 'file') {
          const content = await fs.promises.readFile(filepath);

          zipDir.file(file, content);
        } else if (filetype === 'dir') {
          const zipDirNew = zipDir.folder(file);

          await addToZip(filepath, zipDirNew);
        }
      }
    };

    await addToZip(this.dir, zip);

    const { saveAs } = await import('file-saver');

    zip.generateAsync({ type: 'blob' }).then((content) => {
      saveAs(content, 'archive.zip');
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

  async getRemote() {
    const { getConfig } = await import('isomorphic-git');

    return getConfig({
      fs,
      dir: this.dir,
      path: 'remote.origin.url',
    });
  }

  async populateLFS(remote, token) {
    const files = await fs.promises.readdir(`${this.dir}/lfs`);

    for (const filename of files) {
      await this.fetchAsset(filename, token);
    }
  }

  // returns Blob
  async fetchAsset(filename, token) {
    // eslint-disable-next-line
    if (__BUILD_MODE__ === 'server') {
      const lfspath = `/api/lfs/${filename}`;

      const result = await fetch(lfspath);

      if (result.ok) {
        return result.blob();
      }
    }

    let content = await this.fetchFile(`lfs/${filename}`);

    const contentBuf = Buffer.from(content);

    const { downloadBlobFromPointer, pointsToLFS, readPointer } = await import('@fetsorn/isogit-lfs');

    if (pointsToLFS(contentBuf)) {
      const remote = await this.getRemote();

      const pointer = await readPointer({ dir: this.dir, content: contentBuf });

      const http = await import('isomorphic-git/http/web/index.cjs');

      content = await downloadBlobFromPointer(
        fs,
        {
          http,
          url: remote,
          auth: {
            username: token,
            password: token,
          },
        },
        pointer,
      );
    }

    return content;
  }

  async writeFeed(xml) {
    await this.writeFile('feed.xml', xml);
  }

  static async downloadUrlFromPointer(url, token, pointerInfo) {
    const http = await import('isomorphic-git/http/web/index.cjs');

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

  static async uploadBlobsLFS(url, token, files) {
    const { uploadBlobs } = await import('@fetsorn/isogit-lfs');

    await uploadBlobs({
      url,
      auth: {
        username: token,
        password: token,
      },
    }, files);
  }
}
