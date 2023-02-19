import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { digestMessage, randomUUIDPolyfill } from "@fetsorn/csvs-js";
import { API } from '@/api';
import { useStore } from "@/store";
import { EditInput , InputDropdown } from "..";

interface IInputArrayProps {
  schema: any;
  entry: any;
  onFieldChange: any;
}

async function addField(
  schema: any,
  entryOriginal: any,
  branch: string
) {
  // used to use deepClone
  const entry = JSON.parse(JSON.stringify(entryOriginal));

  let value;

  if (schema[branch].type === "object" || schema[branch].type === "array") {
    const obj: any = {};

    obj["|"] = branch;

    const uuid = crypto.randomUUID ? crypto.randomUUID() : randomUUIDPolyfill();

    obj.UUID = await digestMessage(uuid);

    if (schema[branch].type === "array") {
      obj.items = [];
    }

    value = obj;
  } else {
    value = "";
  }
  const base = entry["|"];

  const { trunk } = schema[branch];

  if (trunk !== base && branch !== base) {
    return;
  }

  if (schema[base].type === "array") {
    if (entry.items === undefined) {
      entry.items = [];
    }

    entry.items.push({ ...value });
  } else {
    entry[branch] = value;
  }
  return entry;
}

export default function InputArray({
  schema,
  entry,
  onFieldChange,
}: IInputArrayProps) {
  const { t } = useTranslation();

  const [options, setOptions]: any[] = useState([]);

  const repoRoute = useStore((state) => state.repoRoute);

  const api = new API(repoRoute);

  const base = useStore((state) => state.base);

  const branch = entry['|'];

  const leaves = Object.keys(schema).filter((leaf) => schema[leaf].trunk === branch)

  const items = entry.items
    ? entry.items.sort((a: any, b: any) => a.UUID.localeCompare(b.UUID))
    : [];

  async function onFieldAddArrayItem(itemBranch: string) {
    console.log('onFieldAddArrayItem', itemBranch);

    const arrayNew = await addField(schema, entry, itemBranch);

    onFieldChange(branch, arrayNew);
  }

  async function onUseEffect() {
    if (branch !== base) {
      const options = await api.queryOptions(branch);

      setOptions(options);
    }
  }

  useEffect(() => {
    onUseEffect();
  }, []);

  return (
    <div>
      <div>{entry.UUID}</div>

      { options.length > 0 && (
        <select
          value="default"
          onChange={({ target: { value } }) => {
            onFieldChange(branch, JSON.parse(value))
          }}
        >
          <option hidden disabled value="default">
            {t("line.dropdown.input")}
          </option>

          {options.map((field: any, idx: any) => (
            <option key={idx} value={JSON.stringify(field)}>
              {JSON.stringify(field)}
            </option>
          ))}
        </select>
      )}

      <InputDropdown {...{ schema, fields: leaves, onFieldAdd: onFieldAddArrayItem }} />

      {items.map((item: any, index: any) => {
        function onFieldChangeArrayItem(itemBranch: string, itemValue: any) {
          const itemsNew = entry.items?.filter((i: any) => i.UUID !== item.UUID) ?? [];

          itemsNew.push(itemValue);

          // sort so that the order of objects remains the same after push
          itemsNew.sort((a: any, b: any) => a.UUID.localeCompare(b.UUID));

          const arrayNew = { '|': entry['|'], UUID: entry.UUID, items: itemsNew };

          onFieldChange(branch, arrayNew);
        }

        function onFieldRemoveArrayItem() {
          const itemsNew = entry.items?.filter((i: any) => i.UUID !== item.UUID) ?? [];

          const arrayNew = { '|': entry['|'], UUID: entry.UUID, items: itemsNew };

          onFieldChange(branch, arrayNew);
        }

        return (
          <div key={index}>
            <EditInput
              {...{
                index: entry.UUID + item.UUID,
                schema,
                entry: item,
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
