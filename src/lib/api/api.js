// import axios from "axios";
import { BrowserAPI } from './browser.js';

export class API {
  // UUID of repo in the store
  uuid;

  #browser;

  constructor(uuid) {
    this.uuid = uuid;

    this.#browser = new BrowserAPI(uuid);
  }

  async fetchAsset(filename) {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case 'electron':
        return window.electron.fetchAsset(this.uuid, filename);

      default:
        return this.#browser.fetchAsset(filename);
    }
  }

  async downloadAsset(filename, filehash) {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case 'electron':
        return window.electron.downloadAsset(this.uuid, filename, filehash);

      default:
        return this.#browser.downloadAsset(filename, filehash);
    }
  }

  async putAsset(filename, buffer) {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case 'electron':
        return window.electron.putAsset(this.uuid, filename, buffer);

      default:
        return this.#browser.putAsset(filename, buffer);
    }
  }

  async uploadFile(file) {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case 'electron':
        return window.electron.uploadFile(this.uuid);

      default:
        return this.#browser.uploadFile(file);
    }
  }

  async select(searchParams) {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case 'electron':
        return window.electron.select(this.uuid, searchParams.toString());

      default:
        return this.#browser.select(searchParams);
    }
  }

  async queryOptions(branch) {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case 'electron':
        return window.electron.queryOptions(this.uuid, branch);

      default:
        return this.#browser.queryOptions(branch);
    }
  }

  async updateEntry(entry, overview = []) {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case 'electron':
        return window.electron.updateEntry(this.uuid, entry, overview);

      default:
        return this.#browser.updateEntry(entry, overview);
    }
  }

  async deleteEntry(entry, overview = []) {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case 'electron':
        return window.electron.deleteEntry(this.uuid, entry, overview);

      default:
        return this.#browser.deleteEntry(entry, overview);
    }
  }

  async ensure(schema, name) {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case 'electron':
        return window.electron.ensure(this.uuid, schema, name);

      default:
        return this.#browser.ensure(schema, name);
    }
  }

  async commit() {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case 'electron':
        return window.electron.commit(this.uuid);

      default:
        return this.#browser.commit();
    }
  }

  // fresh clone from url to uuid dir, symlink to name
  async clone(remoteUrl, remoteToken, name) {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case 'electron':
        return window.electron.clone(this.uuid, remoteUrl, remoteToken, name);

      default:
        return this.#browser.clone(remoteUrl, remoteToken, name);
    }
  }

  async push(remote) {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case 'electron':
        return window.electron.push(this.uuid, remote);

      default:
        return this.#browser.push(remote);
    }
  }

  async pull(remote) {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case 'electron':
        return window.electron.pull(this.uuid, remote);

      default:
        return this.#browser.pull(remote);
    }
  }

  async readSchema() {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case 'electron':
        return window.electron.readSchema(this.uuid);

      default:
        return this.#browser.readSchema();
    }
  }

  async readGedcom() {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case 'electron':
        return window.electron.readGedcom(this.uuid);

      default:
        return this.#browser.readGedcom();
    }
  }

  async readIndex() {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case 'electron':
        return window.electron.readIndex(this.uuid);

      default:
        return this.#browser.readIndex();
    }
  }

  async cloneView(remoteUrl, remoteToken) {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case 'electron':
        return window.electron.cloneView(this.uuid, remoteUrl, remoteToken);

      default:
        return this.#browser.cloneView(remoteUrl, remoteToken);
    }
  }

  async writeFeed(xml) {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case 'electron':
        return window.electron.writeFeed(this.uuid, xml);

      default:
        return this.#browser.writeFeed(xml);
    }
  }

  async uploadBlobsLFS(remote, files) {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case 'electron':
        return window.electron.uploadBlobsLFS(this.uuid, remote, files);

      default:
        return this.#browser.uploadBlobsLFS(remote, files);
    }
  }

  async zip() {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case 'electron':
        return window.electron.zip(this.uuid);

      default:
        return BrowserAPI.zip();
    }
  }

  async listRemotes() {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case 'electron':
        return window.electron.listRemotes(this.uuid);

      default:
        return this.#browser.listRemotes();
    }
  }

  async addRemote(remoteName, remoteUrl, remoteToken) {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case 'electron':
        return window.electron.addRemote(this.uuid, remoteName, remoteUrl, remoteToken);

      default:
        return this.#browser.addRemote(remoteName, remoteUrl, remoteToken);
    }
  }

  async getRemote(remote) {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case 'electron':
        return window.electron.getRemote(this.uuid, remote);

      default:
        return this.#browser.getRemote(remote);
    }
  }

  async addAssetPath(assetPath) {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case 'electron':
        return window.electron.addAssetPath(this.uuid, assetPath);

      default:
        return this.#browser.addAssetPath(assetPath);
    }
  }

  async listAssetPaths() {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case 'electron':
        return window.electron.listAssetPaths(this.uuid);

      default:
        return this.#browser.listAssetPaths();
    }
  }

  async getSettings() {
    const searchParams = new URLSearchParams();

    searchParams.set('reponame', this.uuid);

    const [entry] = await (new API('root')).select(searchParams);

    return entry;
  }
}
