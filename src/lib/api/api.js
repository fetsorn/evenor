// import axios from "axios";
import { BrowserAPI } from './browser.js';
import { QueryWorker } from './query_worker.js';

export class API {
  dir;

  browser;

  constructor(dir) {
    this.dir = dir;

    this.browser = new BrowserAPI(dir);
  }

  async readFile(filepath) {
    // try {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case 'server':
        return (await fetch(`/api/${filepath}`)).text();

        // case "electron": {
        //   return window.electron.readFile(this.dir, filepath);
        // }

      default:
        return this.browser.readFile(filepath);
    }
    // } catch (e) {
    //   console.log(
    //     `Cannot load file. Ensure there is a file ${path}. ${repoRoute} ${path} ${e}`
    //   );
    //   throw Error(`Cannot load file. Ensure there is a file ${path}. ${repoRoute} ${path} ${e}`);
    // }
  }

  async writeFile(filepath, content) {
    // try {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case 'server':
      // await axios.post("/api/" + filepath, {
      //   content,
      // });
        break;

        // case "electron":
        //   await window.electron.writeFile(this.dir, filepath, content);
        //   break;

      default:
        await this.browser.writeFile(filepath, content);
    }
    // } catch (e) {
    //   // throw Error(`Cannot write file ${path}. ${e}`);
    // }
  }

  async uploadFile(file) {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case 'server': {
        const form = new FormData();

        form.append('file', file);

        // await axios.post("/upload", form);

        break;
      }

      default:
        await this.browser.uploadFile(file);
    }
  }

  async select(searchParams) {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      // case 'server': {
      //   const form = new FormData();

      //   form.append('file', file);

      //   await axios.post("/upload", form);

      //   break;
      // }

      default: {
        const queryWorker = new QueryWorker(this.readFile.bind(this));

        const overview = await queryWorker.select(searchParams);

        return overview;
      }
    }
  }

  async queryOptions(branch) {
    const searchParams = new URLSearchParams();

    searchParams.set('|', branch);

    const queryWorker = new QueryWorker(this.readFile.bind(this));

    const overview = await queryWorker.select(searchParams);

    return overview;
  }

  async updateEntry(entry, overview = []) {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
    // case "electron":
    //   return window.electron.updateEntry(this.dir, entry, overview);
    //   break;

      default:
        return this.browser.updateEntry(entry, overview);
    }
  }

  async deleteEntry(entry, overview = []) {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
    // case "electron":
    //   return window.electron.deleteEntry(this.dir, entry, overview);

      default:
        return this.browser.deleteEntry(entry, overview);
    }
  }

  async clone(url, token) {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
    // case "electron":
    //   return window.electron.clone("store/view", url, token);
    //   break;

      default:
        await this.browser.clone(url, token);
    }
  }

  async commit() {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case 'server':
      // await axios.put("api/");
        break;

      default:
        await this.browser.commit();
    }
  }

  async push(token) {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      default:
        await this.browser.push(token);
    }
  }

  async pull(token) {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      default:
        await this.browser.pull(token);
    }
  }

  async addRemote(url) {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      default:
        await this.browser.addRemote(url);
    }
  }

  async ensure(schema) {
    try {
    // eslint-disable-next-line
      switch (__BUILD_MODE__) {
      // case "electron":
      //   return window.electron.ensure(this.dir, schema);

        default:
          return this.browser.ensure(schema);
      }
    } catch (e) {
      throw Error(`${e}`);
    }
  }

  async symlink(name) {
    try {
    // eslint-disable-next-line
      switch (__BUILD_MODE__) {
      // case "electron":
      //   return window.electron.symlink(this.dir, name);

        default:
          return this.browser.symlink(name);
      }
    } catch (e) {
      throw Error(`${e}`);
    }
  }

  async rimraf(rimrafpath) {
    try {
    // eslint-disable-next-line
      switch (__BUILD_MODE__) {
      // case "electron":
      //   return window.electron.rimraf(rimrafpath);

        default:
          return this.browser.rimraf(rimrafpath);
      }
    } catch (e) {
      throw Error(`${e}`);
    }
  }

  async ls(lspath) {
    try {
    // eslint-disable-next-line
      switch (__BUILD_MODE__) {
      // case "electron":
      //   return window.electron.ls(lspath);

        default:
          return this.browser.ls(lspath);
      }
    } catch (e) {
      throw Error(`${e}`);
    }
  }

  async getSettings() {
    const pathname = this.dir.replace(/^repos\//, '');

    const searchParams = new URLSearchParams();

    searchParams.set('reponame', pathname);

    // query root db to get entry with repo settings
    const overview = await (new API('/store/root')).select(searchParams);

    const entry = overview[0];

    return entry;
  }
}
