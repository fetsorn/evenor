import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { EditInput, EditField } from "../index.js";
import { AssetView, Spoiler } from "@/components/index.js";
import {
  API,
  newUUID,
  schemaToBranchRecords,
  enrichBranchRecords,
} from "@/api/index.js";
import { isTwig } from "@fetsorn/csvs-js";
import { useStore } from "@/store/index.js";

export function EditRecord({
  schema,
  index,
  base,
  record,
  onRecordChange,
  onRecordRemove,
}) {
  const { i18n } = useTranslation();

  const [{ repo: repoUUID }, repoRecord, onRecordInput] = useStore((state) => [
    state.repo,
    state.record,
    state.onRecordInput,
  ]);

  const leaves = Object.keys(schema).filter(
    (leaf) => schema[leaf].trunk === base,
  );

  function recordHasLeaf(leaf) {
    return Object.prototype.hasOwnProperty.call(record, leaf);
  }

  function onFieldChange(fieldBranch, fieldValue) {
    const objectNew = { ...record };

    objectNew[fieldBranch] = fieldValue;

    onRecordChange(objectNew);
  }

  function onFieldRemove(fieldBranch) {
    const objectNew = { ...record };

    delete objectNew[fieldBranch];

    onRecordChange(objectNew);
  }

  async function addFileValue(branch) {
    const filehashBranch = Object.keys(schema).find(
      (b) => schema[b].trunk === branch && schema[b].task === "filehash",
    );

    const filenameBranch = Object.keys(schema).find(
      (b) => schema[b].trunk === branch && schema[b].task === "filename",
    );

    const fileextBranch = Object.keys(schema).find(
      (b) => schema[b].trunk === branch && schema[b].task === "fileext",
    );

    const api = new API(repoUUID);

    const metadata = await api.uploadFile();

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

    const valuesOld = record[branch];

    const valuesNew =
      valuesOld === undefined ? records : [...valuesOld, ...records];

    const objectNew = { ...record, [branch]: valuesNew };

    onRecordChange(objectNew);
  }

  async function addLeafValue(branch) {
    const isFile = schema[branch].task === "file";

    if (isFile) {
      return addFileValue(branch);
    }

    const isRemote = repoUUID === "root" && branch === "remote_tag";

    const needsUUID = isRemote;

    const valueDefault = needsUUID ? newUUID() : "";

    const remotePartial = isRemote ? { remote_url: "", remote_token: "" } : {};

    const value = isTwig(schema, branch)
      ? valueDefault
      : { _: branch, [branch]: valueDefault, ...remotePartial };

    const valuesOld = record[branch];

    const valuesNew =
      valuesOld === undefined ? [value] : [valuesOld, value].flat();

    const objectNew = { ...record, [branch]: valuesNew };

    onRecordChange(objectNew);
  }

  const description =
    schema?.[base]?.description?.[i18n.resolvedLanguage] ?? base;

  async function onClone() {
    try {
      const repoUUIDClone = repoRecord.repo;

      const reponameClone = repoRecord.reponame[0] ?? record.remote_tag;

      const api = new API(repoUUIDClone);

      await api.clone(record.remote_url[0], record.remote_token[0]);

      const schemaClone = await api.readSchema();

      await api.ensure(reponameClone);

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
        remote_tag: record,
      };

      onRecordInput(recordClone);
    } catch (e) {
      console.log("clone failed", e);
      // do nothing
    }
  }

  const isRemote = repoUUID === "root" && base === "remote_tag";

  const isFile = schema[base].task === "file";

  return (
    <Spoiler
      {...{
        index,
        title: base,
        description,
        isOpenDefault: true,
        onRemove: () => onRecordRemove(),
      }}
    >
      <EditInput
        {...{
          schema,
          base,
          index,
          value: record[base],
          description,
          onFieldValueChange: onFieldChange,
        }}
      />

      <select
        value="default"
        onChange={({ target: { value: leaf } }) => addLeafValue(leaf)}
      >
        <option hidden disabled value="default">
          +
        </option>

        {leaves.map((leaf) => (
          <option key={leaf} value={leaf}>
            {leaf}
          </option>
        ))}
      </select>

      {isRemote && (
        <button type="button" title="" onClick={() => onClone()}>
          clone
        </button>
      )}

      <div>
        {leaves.filter(recordHasLeaf).map((leaf, idx) => (
          <EditField
            key={idx}
            {...{
              schema,
              index: `${index}-${leaf}`,
              base: leaf,
              items: Array.isArray(record[leaf])
                ? record[leaf]
                : [record[leaf]],
              description,
              onFieldChange,
              onFieldRemove,
            }}
          />
        ))}
      </div>

      {isFile && <AssetView {...{ record, schema }} />}
    </Spoiler>
  );
}
