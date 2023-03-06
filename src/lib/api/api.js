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

  async fetchAsset(filename, token) {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case 'electron':
        return window.electron.fetchAsset(this.uuid, filename, token);

      default:
        return this.#browser.fetchAsset(filename, token);
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
  async clone(url, token, name) {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case 'electron':
        return window.electron.clone(this.uuid, url, token, name);

      default:
        return this.#browser.clone(url, token, name);
    }
  }

  async push(url, token) {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case 'electron':
        return window.electron.push(this.uuid, url, token);

      default:
        return this.#browser.push(url, token);
    }
  }

  async pull(url, token) {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case 'electron':
        return window.electron.pull(this.uuid, url, token);

      default:
        return this.#browser.pull(url, token);
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

  async cloneView(remote, token) {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case 'electron':
        return window.electron.cloneView(this.uuid, remote, token);

      default:
        return this.#browser.cloneView(remote, token);
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

  async downloadUrlFromPointer(url, token, pointerInfo) {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case 'electron':
        return window.electron.downloadUrlFromPointer(this.uuid, url, token, pointerInfo);

      default:
        return BrowserAPI.downloadUrlFromPointer(url, token, pointerInfo);
    }
  }

  async uploadBlobsLFS(url, token, files) {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case 'electron':
        return window.electron.uploadBlobsLFS(this.uuid, url, token, files);

      default:
        return BrowserAPI.uploadBlobsLFS(url, token, files);
    }
  }

  async getSettings() {
    const searchParams = new URLSearchParams();

    searchParams.set('reponame', this.uuid);

    const [entry] = await (new API('root')).select(searchParams);

    return entry;
  }
}
