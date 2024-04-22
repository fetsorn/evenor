// import axios from "axios";
import { invoke } from "@tauri-apps/api/core";
import { BrowserAPI } from "./browser.js";
import { ReadableStream as ReadableStreamPolyfill } from "web-streams-polyfill";
import { WritableStream as WritableStreamPolyfill } from "web-streams-polyfill";

if (!window.WritableStream) {
  window.WritableStream = WritableStreamPolyfill;
  window.ReadableStream = ReadableStreamPolyfill;
}

(function () {
  File.prototype.arrayBuffer = File.prototype.arrayBuffer || myArrayBuffer;
  Blob.prototype.arrayBuffer = Blob.prototype.arrayBuffer || myArrayBuffer;

  function myArrayBuffer() {
    // this: File or Blob
    return new Promise((resolve) => {
      let fr = new FileReader();
      fr.onload = () => {
        resolve(fr.result);
      };
      fr.readAsArrayBuffer(this);
    })
  }
})();

export class API {
  // UUID of repo in the store
  uuid;

  #browser;

  constructor(uuid) {
    this.uuid = uuid;

    // TODO is unnecessarily created in electron
    this.#browser = new BrowserAPI(uuid);
  }

  async helloWorld(someVariable = "") {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case "electron":
        return

      case "tauri":
        return invoke("hello_world", { someVariable });

      default:
        return this.#browser.helloWorld(someVariable);
    }
  }

  async fetchAsset(filename) {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case "electron":
        return window.electron.fetchAsset(this.uuid, filename);

      default:
        return this.#browser.fetchAsset(filename);
    }
  }

  async downloadAsset(content, filename) {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case "electron":
        return window.electron.downloadAsset(this.uuid, content, filename);

      default:
        return this.#browser.downloadAsset(content, filename);
    }
  }

  async putAsset(filename, buffer) {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case "electron":
        return window.electron.putAsset(this.uuid, filename, buffer);

      default:
        return this.#browser.putAsset(filename, buffer);
    }
  }

  async uploadFile(file) {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case "electron":
        return window.electron.uploadFile(this.uuid);

      default:
        return this.#browser.uploadFile(file);
    }
  }

  async select(searchParams) {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case "electron":
        return window.electron.select(this.uuid, searchParams.toString());

      default:
        return this.#browser.select(searchParams);
    }
  }

  async selectStream(searchParams) {
    // console.log('api/selectStream', searchParams.toString());

    const { uuid } = this;

    let closeHandler;

    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case "electron":
        return {
          strm: new ReadableStream({
            start(controller) {
              function enqueueHandler(event, record) {
                try {
                  controller.enqueue(record);
                } catch {
                  // do nothing
                }
              }

              closeHandler = () => {
                try {
                  controller.close();
                } catch {
                  // do nothing
                }
              };

              return window.electron.selectStream(
                uuid,
                searchParams.toString(),
                enqueueHandler,
                closeHandler,
              );
            },
          }),
          closeHandler,
        };
      default:
        return this.#browser.selectStream(searchParams);
    }
  }

  async queryOptions(branch) {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case "electron":
        return window.electron.queryOptions(this.uuid, branch);

      default:
        return this.#browser.queryOptions(branch);
    }
  }

  async updateRecord(record) {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case "electron":
        return window.electron.updateRecord(this.uuid, record);

      default:
        return this.#browser.updateRecord(record);
    }
  }

  async deleteRecord(record) {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case "electron":
        return window.electron.deleteRecord(this.uuid, record);

      default:
        return this.#browser.deleteRecord(record);
    }
  }

  async ensure(schema, name) {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case "electron":
        return window.electron.ensure(this.uuid, schema, name);

      default:
        return this.#browser.ensure(schema, name);
    }
  }

  async commit() {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case "electron":
        return window.electron.commit(this.uuid);

      default:
        return this.#browser.commit();
    }
  }

  // fresh clone from url to uuid dir, symlink to name
  async clone(remoteUrl, remoteToken, name) {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case "electron":
        return window.electron.clone(this.uuid, remoteUrl, remoteToken, name);

      default:
        return this.#browser.clone(remoteUrl, remoteToken, name);
    }
  }

  async push(remote) {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case "electron":
        return window.electron.push(this.uuid, remote);

      default:
        return this.#browser.push(remote);
    }
  }

  async pull(remote) {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case "electron":
        return window.electron.pull(this.uuid, remote);

      default:
        return this.#browser.pull(remote);
    }
  }

  async readSchema() {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case "electron":
        return window.electron.readSchema(this.uuid);

      default:
        return this.#browser.readSchema();
    }
  }

  async readGedcom() {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case "electron":
        return window.electron.readGedcom(this.uuid);

      default:
        return this.#browser.readGedcom();
    }
  }

  async readIndex() {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case "electron":
        return window.electron.readIndex(this.uuid);

      default:
        return this.#browser.readIndex();
    }
  }

  async cloneView(remoteUrl, remoteToken) {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case "electron":
        return window.electron.cloneView(this.uuid, remoteUrl, remoteToken);

      default:
        return this.#browser.cloneView(remoteUrl, remoteToken);
    }
  }

  async writeFeed(xml) {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case "electron":
        return window.electron.writeFeed(this.uuid, xml);

      default:
        return this.#browser.writeFeed(xml);
    }
  }

  async uploadBlobsLFS(remote, files) {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case "electron":
        return window.electron.uploadBlobsLFS(this.uuid, remote, files);

      default:
        return this.#browser.uploadBlobsLFS(remote, files);
    }
  }

  async zip() {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case "electron":
        return window.electron.zip(this.uuid);

      default:
        return BrowserAPI.zip();
    }
  }

  async listRemotes() {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case "electron":
        return window.electron.listRemotes(this.uuid);

      default:
        return this.#browser.listRemotes();
    }
  }

  async addRemote(remoteName, remoteUrl, remoteToken) {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case "electron":
        return window.electron.addRemote(
          this.uuid,
          remoteName,
          remoteUrl,
          remoteToken,
        );

      default:
        return this.#browser.addRemote(remoteName, remoteUrl, remoteToken);
    }
  }

  async getRemote(remote) {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case "electron":
        return window.electron.getRemote(this.uuid, remote);

      default:
        return this.#browser.getRemote(remote);
    }
  }

  async addAssetPath(assetPath) {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case "electron":
        return window.electron.addAssetPath(this.uuid, assetPath);

      default:
        return this.#browser.addAssetPath(assetPath);
    }
  }

  async listAssetPaths() {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case "electron":
        return window.electron.listAssetPaths(this.uuid);

      default:
        return this.#browser.listAssetPaths();
    }
  }

  async downloadUrlFromPointer(url, token, pointerInfo) {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case "electron":
        return window.electron.downloadUrlFromPointer(
          this.uuid,
          url,
          token,
          pointerInfo,
        );

      default:
        return BrowserAPI.downloadUrlFromPointer(url, token, pointerInfo);
    }
  }

  async getSettings() {
    const searchParams = new URLSearchParams();

    searchParams.set("repo", this.uuid);

    const [record] = await new API("root").select(searchParams);

    return record;
  }
}
