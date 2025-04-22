import api from "@/api/index.js";

export async function readRemoteTags(uuid) {
  const remotes = await api.listRemotes(uuid);

  const remoteTags = await Promise.all(
    remotes.map(async (remoteName) => {
      const [remoteUrl, remoteToken] = await api.getRemote(uuid, remoteName);

      const partialToken = remoteToken ? { remote_token: remoteToken } : {};

      return {
        _: "remote_tag",
        remote_tag: remoteName,
        remote_url: remoteUrl,
        ...partialToken,
      };
    }),
  );

  return remoteTags;
}

export async function readLocalTags(uuid) {
  const locals = await api.listAssetPaths(uuid);

  const localTags = locals.map((local) => ({
    _: "local_tag",
    local_tag: local,
  }));

  return localTags;
}

export async function writeRemoteTags(uuid, tags) {
  const tagsList = Array.isArray(tags) ? tags : [tags];

  for (const tag of tagsList) {
    const name = Array.isArray(tag.remote_tag)
      ? tag.remote_tag[0]
      : tag.remote_tag;

    const url = Array.isArray(tag.remote_url)
      ? tag.remote_url[0]
      : tag.remote_url;

    const token = Array.isArray(tag.remote_token)
      ? tag.remote_token[0]
      : tag.remote_token;

    try {
      await api.addRemote(uuid, name, url, token);
    } catch (e) {
      console.log(e);
      // do nothing
    }
  }
}

export async function writeLocalTags(uuid, tags) {
  const tagList = Array.isArray(tags) ? tags : [tags];

  for (const tag of tagList) {
    const assetPath = typeof tag === "object" ? tag.local_tag : tag;

    try {
      api.addAssetPath(uuid, assetPath);
    } catch {
      // do nothing
    }
  }
}
