// TODO: set default values for required fields
export async function createRecord(schema, base) {
  const record = {};

  record._ = base;

  if (base === "repo") {
    record.repo.reponame = "";

    record.schema = [await generateDefaultSchemaRecord()];
  }

  return record;
}

export async function selectRepo(repoUUID, record) {
  // it's okay to not make a deep clone here
  const recordNew = record;

  const api = new API(record.UUID);

  try {
    const schema = await api.readSchema();

    const schemaRecord = await schemaToRecord(schema);

    recordNew.schema = schemaRecord;
  } catch {
    // do nothing
  }

  const { digestMessage, randomUUID } = await import("@fetsorn/csvs-js");

  try {
    const remotes = await api.listRemotes();

    for (const remoteName of remotes) {
      const [remoteUrl, remoteToken] = await api.getRemote(remoteName);

      if (recordNew.tags === undefined) {
        recordNew.tags = {
          UUID: await digestMessage(await randomUUID()),
          items: [],
        };
      }

      if (recordNew.tags.items === undefined) {
        recordNew.tags.items = [];
      }

      recordNew.tags.items.push({
        _: "remote_tag",
        UUID: await digestMessage(await randomUUID()),
        remote_name: remoteName,
        remote_url: remoteUrl,
        remote_token: remoteToken,
      });
    }
  } catch {
    // do nothing
  }

  try {
    const assetPaths = await api.listAssetPaths();

    for (const assetPath of assetPaths) {
      if (recordNew.tags === undefined) {
        recordNew.tags = {
          UUID: await digestMessage(await randomUUID()),
          items: [],
        };
      }

      if (recordNew.tags.items === undefined) {
        recordNew.tags.items = [];
      }

      recordNew.tags.items.push({
        _: "local_tag",
        UUID: await digestMessage(await randomUUID()),
        local_path: assetPath,
      });
    }
  } catch {
    // do nothing
  }

  return recordNew;
}

export async function saveRepo(repoUUID, record) {
  console.log("saveRepo", repoUUID, record)
  const api = new API(record.UUID);

  const remoteTags =
    record.tags?.items?.filter((item) => item._ === "remote_tag") ?? [];

  let schema = record.schema ? recordToSchema(record.schema) : {};

  for (const remoteTag of remoteTags) {
    // try to clone project to repo directory if record has a remote tag, will fail if repo exists
    try {
      // const [remoteTag] = remoteTags;

      await api.clone(remoteTag.remote_url, remoteTag.remote_token);

      schema = await api.readSchema();
    } catch {
      // do nothing
    }
  }

  // create repo directory with a schema
  await api.ensure(schema, record.repo.reponame);

  for (const remoteTag of remoteTags) {
    try {
      api.addRemote(
        remoteTag.remote_name,
        remoteTag.remote_url,
        remoteTag.remote_token,
      );
    } catch {
      // do nothing
    }
  }

  const localTags =
    record.tags?.items?.filter((item) => item._ === "local_tag") ?? [];

  for (const localTag of localTags) {
    try {
      api.addAssetPath(localTag.local_path);
    } catch {
      // do nothing
    }
  }

  // omit to not save schema branch to csvs
  // eslint-disable-next-line
  const { schema: omitSchema, ...recordNew } = record;

  if (recordNew.tags?.items) {
    // omit to not save remote tags to csvs
    const filteredTags = recordNew.tags.items.filter(
      (item) => item._ !== "remote_tag" && item._ !== "local_tag",
    );

    recordNew.tags.items = filteredTags;
  }

  return recordNew;
}
