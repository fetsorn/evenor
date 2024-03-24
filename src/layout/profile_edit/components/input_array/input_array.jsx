import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { API, deepClone } from "../../../../api";
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

    // pick randomUUID until there's a uuid that follows others in alphabetical order
    let uuid = await randomUUID();

    const uuids = record.items
      ? record.items
          .sort((a, b) => a.UUID?.localeCompare(b.UUID))
          .map((i) => i.UUID)
      : [];

    const uuidLast = uuids[0];

    while (uuidLast && !uuid.localeCompare(uuidLast)) {
      uuid = await randomUUID();
    }

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

export function InputArray({ schema, record, onFieldChange }) {
  const { t } = useTranslation();

  const [options, setOptions] = useState([]);

  const repoUUID = useStore((state) => state.repoUUID);

  const api = new API(repoUUID);

  const base = useStore((state) => state.base);

  const branch = record._;

  const leaves = Object.keys(schema).filter(
    (leaf) => schema[leaf].trunk === branch,
  );

  const items = record.items
    ? record.items.sort((a, b) => a.UUID?.localeCompare(b.UUID))
    : [];

  const isOnlyOption = options.length === 1;

  async function onFieldAddArrayItem(itemBranch) {
    const arrayNew = await addField(schema, record, itemBranch);

    onFieldChange(branch, arrayNew);
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

      {isOnlyOption ? (
        <button onClick={() => onFieldAddArrayItem(leaves[0])}>
          {t("line.button.add-field")}
        </button>
      ) : (
        <InputDropdown
          {...{ schema, fields: leaves, onFieldAdd: onFieldAddArrayItem }}
        />
      )}

      {items.map((item, index) => {
        function onFieldChangeArrayItem(itemBranch, itemValue) {
          const itemsNew =
            record.items?.filter((i) => i.UUID !== item.UUID) ?? [];

          itemsNew.push(itemValue);

          // sort so that the order of objects remains the same after push
          itemsNew.sort((a, b) => a.UUID?.localeCompare(b.UUID));

          const arrayNew = { _: record._, UUID: record.UUID, items: itemsNew };

          onFieldChange(branch, arrayNew);
        }

        function onFieldRemoveArrayItem() {
          const itemsNew =
            record.items?.filter((i) => i.UUID !== item.UUID) ?? [];

          const arrayNew = { _: record._, UUID: record.UUID, items: itemsNew };

          onFieldChange(branch, arrayNew);
        }

        return (
          <div key={`${record.UUID ?? ""}${item.UUID}`}>
            <EditInput
              {...{
                index: `${record.UUID ?? ""}${item.UUID}`,
                schema,
                record: item,
                onFieldChange: onFieldChangeArrayItem,
                onFieldRemove: onFieldRemoveArrayItem,
                onFieldAdd: onFieldAddArrayItem,
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
