import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { API, deepClone } from "../../../..//api";
import { useStore } from "../../../../store/index.js";
import { EditInput, InputDropdown } from "..";

async function addField(schema, recordOriginal, branch) {
  // used to use deepClone
  const record = deepClone(recordOriginal);

  let value;

  if (schema[branch].type === "object" || schema[branch].type === "array") {
    const obj = {};

    obj._ = branch;

    const { digestMessage, randomUUID } = await import("@fetsorn/csvs-js");

    const uuid = await randomUUID();

    obj.UUID = await digestMessage(uuid);

    if (schema[branch].type === "array") {
      obj.items = [];
    }

    value = obj;
  } else {
    value = "";
  }

  const base = record._;

  const { trunk } = schema[branch];

  if (trunk !== base && branch !== base) {
    return undefined;
  }

  if (schema[base].type === "array") {
    if (record.items === undefined) {
      record.items = [];
    }

    record.items.push({ ...value });
  } else {
    record[branch] = value;
  }

  return record;
}

export function InputObject({ schema, record, onFieldChange }) {
  const { t } = useTranslation();

  const [options, setOptions] = useState([]);

  const repoUUID = useStore((state) => state.repoUUID);

  const api = new API(repoUUID);

  const base = useStore((state) => state.base);

  const branch = record._;

  const addedLeaves = Object.keys(record).filter(
    (b) => b !== "_" && b !== "UUID",
  );

  const notAddedLeaves = record
    ? Object.keys(schema).filter((leaf) => {
        const isAdded = Object.prototype.hasOwnProperty.call(record, leaf);

        const isNonObjectRoot =
          leaf === branch &&
          schema[branch].trunk === undefined &&
          schema[branch].type !== "object";

        const isLeaf = schema[leaf]?.trunk === branch;

        return !isAdded && (isLeaf || isNonObjectRoot);
      })
    : [];

  async function onAddObjectField(fieldBranch) {
    const objectNew = await addField(schema, record, fieldBranch);

    onFieldChange(branch, objectNew);
  }

  function generateLeaf(leaf) {
    function onFieldChangeObjectField(fieldBranch, fieldValue) {
      const objectNew = { ...record };

      objectNew[fieldBranch] = fieldValue;

      onFieldChange(branch, objectNew);
    }

    function onFieldRemoveObjectField(fieldBranch) {
      const objectNew = { ...record };

      delete objectNew[fieldBranch];

      onFieldChange(branch, objectNew);
    }

    const leafRecord =
      schema[leaf]?.type === "object" || schema[leaf]?.type === "array"
        ? record[leaf]
        : { _: leaf, [leaf]: record[leaf] };

    return (
      <div key={`${record.UUID ?? ""}${leaf}`}>
        <EditInput
          {...{
            index: `${record.UUID ?? ""}${leaf}`,
            schema,
            record: leafRecord,
            onFieldChange: onFieldChangeObjectField,
            onFieldRemove: onFieldRemoveObjectField,
          }}
        />
      </div>
    );
  }

  async function onUseEffect() {
    if (branch !== base) {
      const optionsNew = await api.queryOptions(branch);

      setOptions(optionsNew);
    }
  }

  useEffect(() => {
    onUseEffect();
  }, []);

  return (
    <div>
      <div>{record.UUID}</div>

      {options.length > 0 && (
        <select
          value="default"
          onChange={({ target: { value } }) => {
            onFieldChange(branch, JSON.parse(value));
          }}
        >
          <option hidden disabled value="default">
            {t("line.dropdown.input")}
          </option>

          {options.map((field) => (
            <option
              key={crypto.getRandomValues(new Uint32Array(10)).join("")}
              value={JSON.stringify(field)}
            >
              {JSON.stringify(field)}
            </option>
          ))}
        </select>
      )}

      {notAddedLeaves.length > 0 && (
        <InputDropdown
          {...{ schema, fields: notAddedLeaves, onFieldAdd: onAddObjectField }}
        />
      )}

      {addedLeaves.map(generateLeaf)}
    </div>
  );
}
