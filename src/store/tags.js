import api from "@/api/index.js";

/**
 * This
 * @name readRemoteTags
 * @export function
 * @param {String} mind -
 * @returns {object[]}
 */
export async function readRemoteTags(mind) {
  try {
    const { url: originUrl, token: originToken } = await api.getOrigin(mind);

    const partialToken = originToken ? { origin_token: originToken } : {};

    return [
      {
        _: "origin_url",
        origin_url: originUrl,
        ...partialToken,
      },
    ];
  } catch {
    return [];
  }
}

/**
 * This
 * @name readLocalTags
 * @export function
 * @param {String} mind -
 * @returns {object}
 */
export async function readLocalTags(mind) {
  try {
    const local = await api.getAssetPath(mind);

    const localTag = {
      _: "local_tag",
      local_tag: local,
    };

    return [localTag];
  } catch {
    return [];
  }
}

/**
 * This
 * @name writeRemoteTags
 * @export function
 * @param {String} mind -
 * @param {String[]} originURLs -
 * @returns {object}
 */
export async function writeRemoteTags(mind, originUrls) {
  if (originUrls === undefined) return;

  const originUrl = Array.isArray(originUrls) ? originUrls[0] : originUrls;

  const url = Array.isArray(originUrl.origin_url)
    ? originUrl.origin_url[0]
    : originUrl.origin_url;

  const token = Array.isArray(originUrl.origin_token)
    ? originUrl.origin_token[0]
    : originUrl.origin_token;

  try {
    await api.setOrigin(mind, url, token);
  } catch (e) {
    //console.error(e);
    // do nothing
  }
}

/**
 * This
 * @name writeLocalTags
 * @export function
 * @param {String} mind -
 * @param {object[]} tags -
 * @returns {object}
 */
export async function writeLocalTags(mind, tags) {
  if (tags === undefined) return;

  const tagList = Array.isArray(tags) ? tags : [tags];

  for (const tag of tagList) {
    const assetPath = typeof tag === "object" ? tag.local_tag : tag;

    try {
      api.setAssetPath(mind, assetPath);
    } catch {
      // do nothing
    }
  }
}
