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
        return this.#browser.tbn2(url, token, name);
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

  async getSettings() {
    const searchParams = new URLSearchParams();

    // search for UUID
    searchParams.set('reponame', this.uuid);

    // query root db to get entry with repo settings
    const overview = await (new API('root')).select(searchParams);

    const [entry] = overview;

    return entry;
  }
}
