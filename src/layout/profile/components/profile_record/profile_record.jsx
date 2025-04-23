import { useContext } from "solid-js";
import { StoreContext, newUUID } from "@/store/index.js";
import { ProfileField, ProfileValue } from "../index.js";
import api from "@/api/index.js";

export function ProfileRecord(props) {
  const { store } = useContext(StoreContext);

  function recordHasLeaf(leaf) {
    return Object.hasOwn(props.record, leaf);
  }

  const isRemote = () => {
    if (store.repo === undefined) return false;

    store.repo.repo === "root" && props.record._ === "remote_tag";
  };

  async function onClone() {
    try {
      const repoUUIDClone = store.record.repo;

      const reponameClone = store.record.reponame[0] ?? props.record.remote_tag;

      await api.clone(
        repoUUIDClone,
        props.record.remote_url[0],
        props.record.remote_token[0],
      );

      const schemaClone = await readSchema(repoUUIDClone);

      await api.createRepo(repoUUIDClone, reponameClone);

      const [schemaRecordClone, ...metaRecordsClone] =
        schemaToBranchRecords(schemaClone);

      const branchRecordsClone = enrichBranchRecords(
        schemaRecordClone,
        metaRecordsClone,
      );

      const recordClone = {
        _: "repo",
        repo: repoUUIDClone,
        reponame: reponameClone,
        branch: branchRecordsClone,
        remote_tag: props.record,
      };

      onRecordInput(recordClone);
    } catch (e) {
      console.log("clone failed", e);
      // do nothing
    }
  }

  // TODO move to a file related component
  async function addFileValue(branch) {
    const filehashBranch = Object.keys(schema).find(
      (b) => schema[b].trunks.includes(branch) && schema[b].task === "filehash",
    );

    const filenameBranch = Object.keys(schema).find(
      (b) => schema[b].trunks.includes(branch) && schema[b].task === "filename",
    );

    const fileextBranch = Object.keys(schema).find(
      (b) => schema[b].trunks.includes(branch) && schema[b].task === "fileext",
    );

    const metadata = await api.uploadFile(repoUUID);

    const records = metadata.map(({ hash, name, extension }) => {
      const filehashPartial = filehashBranch ? { [filehashBranch]: hash } : {};

      const filenamePartial = filenameBranch ? { [filenameBranch]: name } : {};

      const fileextPartial = fileextBranch
        ? { [fileextBranch]: extension }
        : {};

      return {
        _: branch,
        [branch]: newUUID(),
        ...filehashPartial,
        ...filenamePartial,
        ...fileextPartial,
      };
    });

    const valuesOld = props.record[branch];

    const valuesNew =
      valuesOld === undefined ? records : [...valuesOld, ...records];

    const objectNew = { ...props.record, [branch]: valuesNew };

    onRecordChange(objectNew);
  }

  const isFile = () => {
    if (
      store.schema === undefined ||
      store.schema[props.record._] === undefined
    )
      return false;

    store.schema[props.record._].task === "file";
  };

  function addLeafValue(leaf) {
    const isLeafFile = store.schema[leaf].task === "file";

    if (isLeafFile) {
      return addFileValue(leaf);
    }

    const isLeafRemote = repoUUID === "root" && leaf === "remote_tag";

    const needsUUID = isLeafRemote;

    const valueDefault = needsUUID ? newUUID() : "";

    const remotePartial = isLeafRemote
      ? { remote_url: "", remote_token: "" }
      : {};

    const isTwig = store.schema[leaf].leaves.length === 0;

    const value = isTwig
      ? valueDefault
      : { _: leaf, [leaf]: valueDefault, ...remotePartial };

    const valuesOld = props.record[leaf];

    const valuesNew =
      valuesOld === undefined ? [value] : [valuesOld, value].flat();

    const record = { ...props.record, [leaf]: valuesNew };

    props.onRecordChange(record);
  }

  function onFieldRemove(field) {
    const { [field]: omit, ...recordWithoutField } = props.record;

    props.onRecordChange(recordWithoutField);
  }

  function onFieldChange(field, value) {
    const record = { ...props.record, [field]: value };

    props.onRecordChange(record);
  }

  return (
    <span>
      <ProfileValue
        value={props.record[props.record._]}
        branch={props.record._}
        onValueChange={(value) => onFieldChange(props.record._, value)}
      />

      <span> </span>

      <Show when={isRemote()} fallback={<></>}>
        <a onClick={() => onClone()}>clone</a>
      </Show>

      <span> </span>

      <Index
        each={
          store.schema !== undefined &&
          store.schema[props.record._] !== undefined &&
          store.schema[props.record._].leaves
        }
        fallback={<span>record no items</span>}
      >
        {(item, index) => {
          const leaf = item();

          if (recordHasLeaf(leaf)) {
            const value = props.record[leaf];

            const items = Array.isArray(value) ? value : [value];

            return (
              <span>
                <span> </span>

                <ProfileField
                  index={`${props.index}-${leaf}`}
                  baseRecord={props.baseRecord}
                  branch={leaf}
                  items={items}
                  onFieldChange={onFieldChange}
                  onFieldRemove={onFieldRemove}
                />

                <span> </span>

                <a onClick={() => addLeafValue(leaf)}>Add another {leaf} </a>
              </span>
            );
          } else {
            return <a onClick={() => addLeafValue(leaf)}>Add {leaf} </a>;
          }
        }}
      </Index>

      <Show when={isFile()} fallback={<></>}>
        {/*<AssetView record={record} />*/}
      </Show>
    </span>
  );
}
