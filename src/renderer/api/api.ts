import axios from "axios";
import { BrowserAPI } from "./browser";

export default class API {
  dir;

  browser;

  constructor(dir: string) {
    this.dir = dir;

    this.browser = new BrowserAPI(dir);
  }

  async readFile(path: string) {
    try {
      switch (__BUILD_MODE__) {
      case "server":
        return (await fetch("/api/" + path)).text();

      case "electron":
        return await window.electron.readFile(this.dir, path);

      default:
        return await this.browser.readFile(path);
      }
    } catch (e) {
      // console.log(
      //   `Cannot load file. Ensure there is a file ${path}. ${repoRoute} ${path} ${e}`
      // );
      // throw Error(`Cannot load file. Ensure there is a file ${path}. ${repoRoute} ${path} ${e}`);
    }
  }

  async writeFile(path: string, content: string) {
    try {
      switch (__BUILD_MODE__) {
      case "server":
        await axios.post("/api/" + path, {
          content,
        });
        break;

      case "electron":
        await window.electron.writeFile(this.dir, path, content);
        break;

      default:
        await this.browser.writeFile(path, content);
      }
    } catch (e) {
      // throw Error(`Cannot write file ${path}. ${e}`);
    }
  }

  async uploadFile(file: File) {
    switch (__BUILD_MODE__) {
    case "server": {
      const form = new FormData();

      form.append("file", file);

      await axios.post("/upload", form);

      break;
    }

    default:
      await this.browser.uploadFile(file);
    }
  }

  async select(searchParams: URLSearchParams) {
    switch (__BUILD_MODE__) {
    default: {
      return this.browser.select(searchParams);
    }
    }
  }

  async queryOptions(branch: string) {
    switch (__BUILD_MODE__) {
    default: {
      return this.browser.queryOptions(branch);
    }
    }
  }

  async updateEntry(entry: any, overview: any = []) {
    switch (__BUILD_MODE__) {
    case "electron":
      return window.electron.updateEntry(this.dir, entry, overview);
      break;

    default:
      return this.browser.updateEntry(entry, overview);
    }
  }

  async deleteEntry(entry: any, overview: any = []) {
    switch (__BUILD_MODE__) {
    case "electron":
      return window.electron.deleteEntry(this.dir, entry, overview);

    default:
      return this.browser.deleteEntry(entry, overview);
    }
  }

  async clone(url: string, token: string) {
    switch (__BUILD_MODE__) {
    case "electron":
      return await window.electron.clone("store/view", url, token);
      break;

    default:
      await this.browser.clone(url, token);
    }
  }

  async commit() {
    switch (__BUILD_MODE__) {
    case "server":
      await axios.put("api/");
      break;

    default:
      await this.browser.commit();
    }
  }

  async push(token: string) {
    switch (__BUILD_MODE__) {
    default:
      await this.browser.push(token);
    }
  }

  async pull(token: string) {
    switch (__BUILD_MODE__) {
    default:
      await this.browser.pull(token);
    }
  }

  async addRemote(url: string) {
    switch (__BUILD_MODE__) {
    default:
      await this.browser.addRemote(url);
    }
  }

  async ensure(schema: string) {
    try {
      switch (__BUILD_MODE__) {
      case "electron":
        return await window.electron.ensure(this.dir, schema);

      default:
        return await this.browser.ensure(schema);
      }
    } catch (e) {
      throw Error(`${e}`);
    }
  }

  async symlink(name: string) {
    try {
      switch (__BUILD_MODE__) {
      case "electron":
        return await window.electron.symlink(this.dir, name);

      default:
        return await this.browser.symlink(name);
      }
    } catch (e) {
      throw Error(`${e}`);
    }
  }

  async rimraf(path: string) {
    try {
      switch (__BUILD_MODE__) {
      case "electron":
        return window.electron.rimraf(path);

      default:
        return await this.browser.rimraf(path);
      }
    } catch (e) {
      throw Error(`${e}`);
    }
  }

  async ls(path: string) {
    try {
      switch (__BUILD_MODE__) {
      case "electron":
        return window.electron.ls(path);

      default:
        return await this.browser.ls(path);
      }
    } catch (e) {
      throw Error(`${e}`);
    }
  }

  async getSettings() {
    const pathname = this.dir.replace(/^repos\//, "");

    const searchParams = new URLSearchParams();

    searchParams.set("reponame", pathname);

    // query root db to get entry with repo settings
    const overview = await (new API("/store/root")).select(searchParams);

    const entry = overview[0];

    return entry;
  }
}
