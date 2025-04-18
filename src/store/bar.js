import api from "../api/index.js";

export async function readRemotes(uuid) {
  const remotes = await api.listRemotes(uuid);

  const remoteTags = await Promise.all(
    remotes.map(async (remoteName) => {
      const [remoteUrl, remoteToken] = await api.getRemote(uuid, remoteName);

      const partialToken = remoteToken ? { remote_token: remoteToken } : {};

      return {
        _: "remote_tag",
        remote_name: remoteName,
        remote_url: remoteUrl,
        ...partialToken,
      };
    }),
  );

  return remoteTags;
}

export async function readAssetPaths(uuid) {
  const locals = await api.listAssetPaths(uuid);

  return locals;
}

export async function writeRemotes(uuid, tags) {
  const tagsList = Array.isArray(tags) ? tags : [tags];

  for (const tag of tagsList) {
    try {
      await api.addRemote(
        uuid,
        tag.remote_tag,
        tag.remote_url[0],
        tag.remote_token,
      );
    } catch (e) {
      console.log(e);
      // do nothing
    }
  }
}

export async function writeAssetPaths(uuid, tags) {
  const tagList = Array.isArray(tags) ? tags : [tags];

  for (const tag of tagList) {
    try {
      api.addAssetPath(uuid, tag);
    } catch {
      // do nothing
    }
  }
}
