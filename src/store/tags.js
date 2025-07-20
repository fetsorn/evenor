import api from "@/api/index.js";

export async function readRemoteTags(uuid) {
  const { url: originUrl, token: originToken } = await api.getOrigin(uuid);

  const partialToken = originToken ? { origin_token: originToken } : {};

  return [
    {
      _: "origin_url",
      origin_url: originUrl,
      ...partialToken,
    },
  ];
}

export async function readLocalTags(uuid) {
  const local = await api.getAssetPath(uuid);

  const localTag = {
    _: "local_tag",
    local_tag: local,
  };

  return [localTag];
}

export async function writeRemoteTags(uuid, originUrls) {
  const originUrl = Array.isArray(originUrls) ? originUrls[0] : originUrls;

  const url = Array.isArray(originUrl.origin_url)
    ? originUrl.origin_url[0]
    : originUrl.origin_url;

  const token = Array.isArray(originUrl.origin_token)
    ? originUrl.origin_token[0]
    : originUrl.origin_token;

  try {
    await api.setOrigin(uuid, url, token);
  } catch (e) {
    console.log(e);
    // do nothing
  }
}

export async function writeLocalTags(uuid, tags) {
  if (tags === undefined) return;

  const tagList = Array.isArray(tags) ? tags : [tags];

  for (const tag of tagList) {
    const assetPath = typeof tag === "object" ? tag.local_tag : tag;

    try {
      api.setAssetPath(uuid, assetPath);
    } catch {
      // do nothing
    }
  }
}
