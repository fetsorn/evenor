import mindzoo from "@fetsorn/mindzoo";

export function initIO(fs) {
  async function findMind(mind) {
    return mindzoo.findMind(fs, mind);
  }

  async function zip(mind) {
    return mindzoo(fs, mind);
  }

  async function gitinit(mind, name) {
    return mindzoo.gitinit(fs, mind, name);
  }

  async function clone(mind, remote) {
    return mindzoo.clone(fs, mind, remote);
  }

  async function commit(mind) {
    return mindzoo.commit(fs, mind);
  }

  async function setOrigin(mind, remote) {
    return mindzoo.setOrigin(fs, mind, remote);
  }

  async function getOrigin(mind) {
    return mindzoo.getOrigin(fs, mind);
  }

  async function resolve(mind, remote, resolutions) {
    return mindzoo.resolve(fs, mind, remote, resolutions);
  }

  async function rename(mind, name) {
    return mindzoo.rename(fs, mind, name);
  }

  async function createLFS(mind) {
    return mindzoo.createLFS(fs, mind);
  }

  async function fetchAsset(mind, filename) {
    return mindzoo.fetchAsset(fs, mind, filename);
  }

  async function putAsset(mind, filename, content) {
    return mindzoo.putAsset(fs, mind, filename, content);
  }

  async function uploadFile(mind) {
    return mindzoo.uploadFile(fs, mind);
  }

  async function uploadBlobsLFS(mind, remoteUrl, remoteToken, files) {
    return mindzoo.uploadBlobsLFS(fs, mind, remoteUrl, remoteToken, files);
  }

  function downloadAsset(content, filename) {
    return mindzoo.downloadAsset(content, filename);
  }

  async function downloadUrlFromPointer(url, token, pointerInfo) {
    return mindzoo.downloadUrlFromPointer(url, token, pointerInfo);
  }

  async function setAssetPath(mind, assetPath) {
    return mindzoo.setAssetPath(fs, mind, assetPath);
  }

  async function getAssetPath(mind) {
    return mindzoo.getAssetPath(fs, mind);
  }

  return {
    zip,
    gitinit,
    clone,
    commit,
    findMind,
    setOrigin,
    getOrigin,
    resolve,
    rename,
    createLFS,
    fetchAsset,
    putAsset,
    uploadFile,
    uploadBlobsLFS,
    downloadAsset,
    downloadUrlFromPointer,
    setAssetPath,
    getAssetPath,
  };
}
