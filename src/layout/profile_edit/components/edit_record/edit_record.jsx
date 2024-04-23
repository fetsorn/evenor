import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { EditInput, EditField } from "../index.js";
import { Spoiler } from "@/components/index.js";
import { API, newUUID } from "@/api/index.js";
import { isTwig } from "@fetsorn/csvs-js";
import { useStore } from "@/store/index.js";

export function EditRecord({ schema, index, base, record, onRecordChange, onRecordRemove }) {
  const { i18n } = useTranslation();

  const { repo: repoUUID } = useStore((state) => state.repo);

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
      const filehashPartial = filehashBranch
            ? { [filehashBranch]: hash }
            : {};

      const filenamePartial = filenameBranch
            ? { [filenameBranch]: name }
            : {};

      const fileextPartial = fileextBranch
            ? { [fileextBranch]: extension }
            : {};

      return {
        _: branch,
        [branch]: newUUID(),
        ...filehashPartial,
        ...filenamePartial,
        ...fileextPartial,
      }
    });

    const valuesOld = record[branch];

    const valuesNew = valuesOld === undefined
          ? records
          : [ ...valuesOld, ...records ];

    const objectNew = { ...record, [branch]: valuesNew };

    onRecordChange(objectNew);
  }

  async function addLeafValue(branch) {
    const isFile = schema[branch].task === "file";

    if (isFile) {
      return addFileValue(branch)
    }

    const needsUUID = schema[branch].task === "file";

    const valueDefault = needsUUID ? newUUID() : "";

    // TODO: if task is file, call upload and insert the fields

    const value = isTwig(schema, branch)
      ? valueDefault
      : { _: branch, [branch]: valueDefault };

    const valuesOld = record[branch];

    const valuesNew =
      valuesOld === undefined ? [value] : [valuesOld, value].flat();

    const objectNew = { ...record, [branch]: valuesNew };

    onRecordChange(objectNew);
  }

  const description =
    schema?.[base]?.description?.[i18n.resolvedLanguage] ?? base;

  return (
    <Spoiler
      {...{
        index,
        title: base,
        description,
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

      <div>
        {leaves.filter(recordHasLeaf).map((leaf, idx) => (
          <EditField
            key={idx}
            {...{
              schema,
              index,
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
    </Spoiler>
  );
}
