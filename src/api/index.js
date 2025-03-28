// import axios from "axios";
import { invoke, Channel } from "@tauri-apps/api/core";
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
    });
  }
})();

export class API {
  // UUID of repo in the store
  uuid;

  #browser;

  constructor(uuid) {
    this.uuid = uuid;

    this.#browser = new BrowserAPI(uuid);
  }

  async helloWorld(someVariable = "") {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case "tauri":
        return invoke("hello_world", { someVariable });

      default:
        return this.#browser.helloWorld(someVariable);
    }
  }

  async fetchAsset(filename) {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case "tauri":
        return invoke("fetch_asset", { uuid: this.uuid, filename });

      default:
        return this.#browser.fetchAsset(filename);
    }
  }

  async downloadAsset(content, filename) {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case "tauri":
        return invoke("download_asset", { uuid: this.uuid, content, filename });

      default:
        return this.#browser.downloadAsset(content, filename);
    }
  }

  async putAsset(filename, buffer) {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case "tauri":
        return invoke("put_asset", { uuid: this.uuid, filename, buffer });

      default:
        return this.#browser.putAsset(filename, buffer);
    }
  }

  async uploadFile() {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case "tauri":
        return invoke("upload_file", { uuid: this.uuid });

      default:
        return this.#browser.uploadFile();
    }
  }

  async select(query) {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case "tauri":
        return invoke("select", { uuid: this.uuid, query });

      default:
        return this.#browser.select(query);
    }
  }

  async selectStream(query) {
    // console.log('api/selectStream', query);

    const { uuid } = this;

    let closeHandler;

    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case "tauri":
        return {
          strm: new ReadableStream({
            async start(controller) {
              const onEvent = new Channel();

              onEvent.onmessage = (message) => {
                if (message.event === "progress") {
                  controller.enqueue(message.data.entry);
                } else if (message.event === "finished") {
                  controller.close();
                }
              };

              closeHandler = () => {
                try {
                  controller.close();
                } catch {
                  // do nothing
                }
              };

              return invoke("select_stream", {
                uuid,
                query,
                onEvent,
              });
            },
          }),
          closeHandler,
        };

      default:
        return this.#browser.selectStream(query);
    }
  }

  async updateRecord(record) {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case "tauri":
        return invoke("update_record", { uuid: this.uuid, record });

      default:
        return this.#browser.updateRecord(record);
    }
  }

  async deleteRecord(record) {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case "tauri":
        return invoke("delete_record", { uuid: this.uuid, record });

      default:
        return this.#browser.deleteRecord(record);
    }
  }

  async ensure(name) {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case "tauri":
        return invoke("ensure", { uuid: this.uuid, name });

      default:
        return this.#browser.ensure(name);
    }
  }

  async commit() {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case "tauri":
        return invoke("commit", { uuid: this.uuid });

      default:
        return this.#browser.commit();
    }
  }

  // fresh clone from url to uuid dir, symlink to name
  async clone(remoteUrl, remoteToken, name) {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case "tauri":
        return invoke("clone", {
          uuid: this.uuid,
          remoteUrl,
          remoteToken: "",
          name,
        });

      default:
        return this.#browser.clone(remoteUrl, remoteToken, name);
    }
  }

  async push(remote) {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case "tauri":
        return invoke("push", { uuid: this.uuid, remote });

      default:
        return this.#browser.push(remote);
    }
  }

  async pull(remote) {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case "tauri":
        return invoke("pull", { uuid: this.uuid, remote });

      default:
        return this.#browser.pull(remote);
    }
  }

  async uploadBlobsLFS(remote, files) {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case "tauri":
        return invoke("upload_blobs_LFS", { uuid: this.uuid, remote, files });

      default:
        return this.#browser.uploadBlobsLFS(remote, files);
    }
  }

  async zip() {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case "tauri":
        return invoke("zip", { uuid: this.uuid });

      default:
        return this.#browser.zip();
    }
  }

  async listRemotes() {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case "tauri":
        return invoke("list_remotes", { uuid: this.uuid });

      default:
        return this.#browser.listRemotes();
    }
  }

  async addRemote(remoteName, remoteUrl, remoteToken) {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case "tauri":
        return invoke("add_remote", {
          uuid: this.uuid,
          remoteName,
          remoteUrl,
          remoteToken: "",
        });

      default:
        return this.#browser.addRemote(remoteName, remoteUrl, remoteToken);
    }
  }

  async getRemote(remote) {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case "tauri":
        return invoke("get_remote", { uuid: this.uuid, remote });

      default:
        return this.#browser.getRemote(remote);
    }
  }

  async addAssetPath(assetPath) {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case "tauri":
        return invoke("add_asset_path", { uuid: this.uuid, assetPath });

      default:
        return this.#browser.addAssetPath(assetPath);
    }
  }

  async listAssetPaths() {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case "tauri":
        return invoke("list_asset_paths", { uuid: this.uuid });

      default:
        return this.#browser.listAssetPaths();
    }
  }

  async downloadUrlFromPointer(url, token, pointerInfo) {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case "tauri":
        return invoke("download_url_from_pointer", {
          uuid: this.uuid,
          url,
          token,
          pointerInfo,
        });

      default:
        return BrowserAPI.downloadUrlFromPointer(url, token, pointerInfo);
    }
  }
}
