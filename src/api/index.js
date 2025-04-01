// import axios from "axios";
import { invoke, Channel } from "@tauri-apps/api/core";
import { ReadableStream as ReadableStreamPolyfill } from "web-streams-polyfill";
import { WritableStream as WritableStreamPolyfill } from "web-streams-polyfill";
import browser from "./browser.js";

if (!window.WritableStream) {
  window.WritableStream = WritableStreamPolyfill;
  window.ReadableStream = ReadableStreamPolyfill;
}

// NOTE which code needs this polyfill?
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

export async function helloWorld(uuid, someVariable = "") {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case "tauri":
        return invoke("hello_world", { someVariable });

      default:
        return browser.helloWorld(someVariable);
    }
  }

export async function fetchAsset(uuid, filename) {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case "tauri":
        return invoke("fetch_asset", { uuid, filename });

      default:
        return browser.fetchAsset(filename);
    }
  }

export async function downloadAsset(uuid, content, filename) {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case "tauri":
        return invoke("download_asset", { uuid, content, filename });

      default:
        return browser.downloadAsset(content, filename);
    }
  }

export async function putAsset(uuid, filename, buffer) {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case "tauri":
        return invoke("put_asset", { uuid, filename, buffer });

      default:
        return browser.putAsset(filename, buffer);
    }
  }

export async function uploadFile(uuid) {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case "tauri":
        return invoke("upload_file", { uuid });

      default:
        return browser.uploadFile();
    }
  }

export async function select(uuid, query) {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case "tauri":
        return invoke("select", { uuid, query });

      default:
        return browser.select(query);
    }
  }

export async function selectStream(uuid, query) {
    // console.log('api/selectStream', query);

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
        return browser.selectStream(query);
    }
  }

export async function updateRecord(uuid, record) {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case "tauri":
        return invoke("update_record", { uuid, record });

      default:
        return browser.updateRecord(record);
    }
  }

export async function deleteRecord(uuid, record) {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case "tauri":
        return invoke("delete_record", { uuid, record });

      default:
        return browser.deleteRecord(record);
    }
  }

export async function ensure(uuid, name) {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case "tauri":
        return invoke("ensure", { uuid, name });

      default:
        return browser.ensure(name);
    }
  }

export async function commit(uuid) {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case "tauri":
        return invoke("commit", { uuid });

      default:
        return browser.commit();
    }
  }

  // fresh clone from url to uuid dir, symlink to name
export async function clone(uuid, remoteUrl, remoteToken, name) {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case "tauri":
        return invoke("clone", {
          uuid,
          remoteUrl,
          remoteToken: "",
          name,
        });

      default:
        return browser.clone(remoteUrl, remoteToken, name);
    }
  }

export async function push(uuid remote) {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case "tauri":
        return invoke("push", { uuid, remote });

      default:
        return browser.push(remote);
    }
  }

export async function pull(uuid, remote) {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case "tauri":
        return invoke("pull", { uuid, remote });

      default:
        return browser.pull(remote);
    }
  }

export async function uploadBlobsLFS(uuid, remote, files) {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case "tauri":
        return invoke("upload_blobs_LFS", { uuid, remote, files });

      default:
        return browser.uploadBlobsLFS(remote, files);
    }
  }

export async function zip(uuid) {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case "tauri":
        return invoke("zip", { uuid });

      default:
        return browser.zip();
    }
  }

export async function listRemotes(uuid) {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case "tauri":
        return invoke("list_remotes", { uuid });

      default:
        return browser.listRemotes(uuid);
    }
  }

export async function addRemote(uuid, remoteName, remoteUrl, remoteToken) {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case "tauri":
        return invoke("add_remote", {
          uuid,
          remoteName,
          remoteUrl,
          remoteToken: "",
        });

      default:
        return browser.addRemote(remoteName, remoteUrl, remoteToken);
    }
  }

export async function getRemote(uuid, remote) {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case "tauri":
        return invoke("get_remote", { uuid, remote });

      default:
        return browser.getRemote(remote);
    }
  }

export async function addAssetPath(uuid, assetPath) {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case "tauri":
        return invoke("add_asset_path", { uuid, assetPath });

      default:
        return browser.addAssetPath(assetPath);
    }
  }

export async function listAssetPaths(uuid) {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case "tauri":
        return invoke("list_asset_paths", { uuid });

      default:
        return browser.listAssetPaths();
    }
  }

export async function downloadUrlFromPointer(uuid, url, token, pointerInfo) {
    // eslint-disable-next-line
    switch (__BUILD_MODE__) {
      case "tauri":
        return invoke("download_url_from_pointer", {
          uuid,
          url,
          token,
          pointerInfo,
        });

      default:
        return BrowserAPI.downloadUrlFromPointer(url, token, pointerInfo);
    }
  }
