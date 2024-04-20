import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { EditInput, EditField } from "../index.js";
import { Spoiler } from "@/components/index.js";
import { newUUID } from "@/api/index.js";
import { isTwig } from "@fetsorn/csvs-js";

export function EditRecord({ schema, index, base, record, onRecordChange, onRecordRemove }) {
  const { i18n } = useTranslation();

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

  function addLeafValue(branch) {
    const needsUUID = false;

    const valueDefault = needsUUID ? newUUID() : "";

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
