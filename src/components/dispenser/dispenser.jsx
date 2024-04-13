import React from "react";
import {
  RSS,
  schemaRSS,
  Remote,
  schemaRemote,
  Sync,
  schemaSync,
  Zip,
  schemaZip,
  Local,
  schemaLocal,
  TG,
  schemaTG,
} from "./components/index.js";

export const schemaDispenser = {
  ...schemaLocal,
  ...schemaRSS,
  ...schemaRemote,
  // ...schemaSync,
  // ...schemaTG,
  ...schemaZip,
};

// TODO collapse into api.ensure
async function clone(repoUUID, record) {
  //const api = new API(repoUUID);

  // TODO: replace with new tag schema
  //const remoteTags =
  //  record.tags?.items?.filter((item) => item._ === "remote_tag") ?? [];

  //for (const remoteTag of remoteTags) {
  //  // try to clone project to repo directory if record has a remote tag,
  //  // will fail if repo exists
  //  try {
  //    // const [remoteTag] = remoteTags;

  //    await api.clone(remoteTag.remote_url, remoteTag.remote_token);

  //    const schema = await api.readSchema();

  //    return { schema, ...record }
  //  } catch {
  //    // do nothing
  //  }
  //}

  return record;
}

async function writeGitTags(repoUUID, record) {
  //const api = new API(repoUUID);
  //const remoteTags =
  //  record.tags?.items?.filter((item) => item._ === "remote_tag") ?? [];
  //for (const remoteTag of remoteTags) {
  //  try {
  //    api.addRemote(
  //      remoteTag.remote_name,
  //      remoteTag.remote_url,
  //      remoteTag.remote_token,
  //    );
  //  } catch {
  //    // do nothing
  //  }
  //}
  //const localTags =
  //  record.tags?.items?.filter((item) => item._ === "local_tag") ?? [];
  //for (const localTag of localTags) {
  //  try {
  //    api.addAssetPath(localTag.local_path);
  //  } catch {
  //    // do nothing
  //  }
  //}
}

export function dispenserHookBeforeSave(repoUUID, baseRecord) {
  // TODO check if there is a dataset with given repoUUID
  // clone for remote tag
  // TODO clone only if there is no repo
  // or collapse into api.ensure
  // const recordNew = await clone(repoUUID, record);
  return baseRecord
}

export function dispenserHookAfterSave(repoUUID, baseRecord) {
  // writeTags
  return baseRecord
}

export function dispenserHookAfterLoad(repoUUID, baseRecord) {
  // load remote tags, load local tags
  return baseRecord;
}

// async function readRemoteTags(repoUUID, record) {
//   const api = new API(repoUUID);

//   try {
//     const remotes = await api.listRemotes();

//     const tags = await Promise.all(remotes.map(async (remoteName) => {
//       const [remoteUrl, remoteToken] = await api.getRemote(remoteName);

//       const tag = {
//         _: "remote_tag",
//         UUID: await newUUID(),
//         remote_name: remoteName,
//         remote_url: remoteUrl,
//         remote_token: remoteToken,
//       };

//       return tag;
//     }));

//     return tags;
//   } catch {
//     // do nothing
//   }

//   return {}
// }

// async function readLocalTags(repoUUID, record) {
//   const api = new API(repoUUID);

//   try {
//     const assetPaths = await api.listAssetPaths();

//     const tags = await Promise.all(assetPaths.map(async (assetPath) => {
//       const tag = {
//         _: "local_tag",
//         UUID: await newUUID(),
//         local_path: assetPath,
//       }

//       return tag
//     }))

//     return tags
//   } catch {
//     // do nothing
//   }

//   return {}
// }

export function Dispenser({ baseRecord, branchRecord }) {
  switch (branchRecord._) {
    case "sync_tag":
      return <Sync {...{ baseRecord, branchRecord }} />;

    case "remote_tag":
      return <Remote {...{ baseRecord, branchRecord }} />;

    case "rss_tag":
      return <RSS {...{ baseRecord, branchRecord }} />;

    case "zip_tag":
      return <Zip {...{ baseRecord, branchRecord }} />;

    case "local_tag":
      return <Local {...{ baseRecord, branchRecord }} />;

    case "tg_tag":
      return <TG {...{ baseRecord, branchRecord }} />;

    default:
  }
}
