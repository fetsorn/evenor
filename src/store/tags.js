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
    const origin = await api.getOrigin(mind);

    if (origin === undefined || origin === null) return [];

    const partialToken = origin.token ? { origin_token: origin.token } : {};

    return [
      {
        _: "origin_url",
        origin_url: origin.url,
        ...partialToken,
      },
    ];
  } catch (e) {
    if (e.message !== "no remote") console.log(e);

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
    await api.setOrigin(mind, { url, token });
  } catch (e) {
    console.error(e);
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
