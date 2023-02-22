import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { digestMessage, randomUUIDPolyfill } from '@fetsorn/csvs-js';
import { API, deepClone } from 'lib/api';
import { useStore } from '@/store/index.js';
import { EditInput, InputDropdown } from '..';

async function addField(
  schema,
  entryOriginal,
  branch,
) {
  // used to use deepClone
  const entry = deepClone(entryOriginal);

  let value;

  if (schema[branch].type === 'object' || schema[branch].type === 'array') {
    const obj = {};

    obj['|'] = branch;

    const uuid = crypto.randomUUID ? crypto.randomUUID() : randomUUIDPolyfill();

    obj.UUID = await digestMessage(uuid);

    if (schema[branch].type === 'array') {
      obj.items = [];
    }

    value = obj;
  } else {
    value = '';
  }
  const base = entry['|'];

  const { trunk } = schema[branch];

  if (trunk !== base && branch !== base) {
    return undefined;
  }

  if (schema[base].type === 'array') {
    if (entry.items === undefined) {
      entry.items = [];
    }

    entry.items.push({ ...value });
  } else {
    entry[branch] = value;
  }

  return entry;
}

export function InputArray({
  schema,
  entry,
  onFieldChange,
}) {
  const { t } = useTranslation();

  const [options, setOptions] = useState([]);

  const repoUUID = useStore((state) => state.repoUUID);

  const api = new API(repoUUID);

  const base = useStore((state) => state.base);

  const branch = entry['|'];

  const leaves = Object.keys(schema).filter((leaf) => schema[leaf].trunk === branch);

  const items = entry.items
    ? entry.items.sort((a, b) => a.UUID.localeCompare(b.UUID))
    : [];

  async function onFieldAddArrayItem(itemBranch) {
    console.log('onFieldAddArrayItem', itemBranch);

    const arrayNew = await addField(schema, entry, itemBranch);

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
      <div>{entry.UUID}</div>

      { options.length > 0 && (
        <select
          value="default"
          onChange={({ target: { value } }) => {
            onFieldChange(branch, JSON.parse(value));
          }}
        >
          <option hidden disabled value="default">
            {t('line.dropdown.input')}
          </option>

          {options.map((field) => (
            <option key={crypto.getRandomValues(new Uint32Array(10)).join('')} value={JSON.stringify(field)}>
              {JSON.stringify(field)}
            </option>
          ))}
        </select>
      )}

      <InputDropdown {...{ schema, fields: leaves, onFieldAdd: onFieldAddArrayItem }} />

      {items.map((item, index) => {
        function onFieldChangeArrayItem(itemBranch, itemValue) {
          const itemsNew = entry.items?.filter((i) => i.UUID !== item.UUID) ?? [];

          itemsNew.push(itemValue);

          // sort so that the order of objects remains the same after push
          itemsNew.sort((a, b) => a.UUID.localeCompare(b.UUID));

          const arrayNew = { '|': entry['|'], UUID: entry.UUID, items: itemsNew };

          onFieldChange(branch, arrayNew);
        }

        function onFieldRemoveArrayItem() {
          const itemsNew = entry.items?.filter((i) => i.UUID !== item.UUID) ?? [];

          const arrayNew = { '|': entry['|'], UUID: entry.UUID, items: itemsNew };

          onFieldChange(branch, arrayNew);
        }

        return (
          <div key={entry.UUID + item.UUID}>
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
