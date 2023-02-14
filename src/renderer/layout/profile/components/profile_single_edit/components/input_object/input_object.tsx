import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { EditInput, InputDropdown } from "..";
import { queryOptions } from "@/api";
import { useStore } from "@/store";

interface IInputObjectProps {
  schema: any;
  entry: any;
  description: any;
  onFieldChange: any;
  onFieldRemove: any;
}

export default function InputObject({
  schema,
  entry,
  description,
  onFieldChange,
  onFieldRemove,
}: IInputObjectProps) {
  const { t } = useTranslation();

  const [options, setOptions]: any[] = useState([]);

  const repoRoute = useStore((state) => state.repoRoute);

  const branch = entry['|']

  const addedLeaves = Object.keys(entry).filter((b) =>  b !== "|" && b !== "UUID")

  const notAddedLeaves = entry
    ? Object.keys(schema).filter((leaf: any) => {
      const isLeaf = schema[leaf]?.trunk === branch;

      const entryHasLeaf = Object.prototype.hasOwnProperty.call(entry, leaf);

      return isLeaf && !entryHasLeaf;
    })
    : [];

  function onAddObjectField(fieldBranch: string) {
    const objectNew = { ...entry };

    objectNew[fieldBranch] = "";

    onFieldChange(branch, objectNew);
  }

  function generateLeaf(leaf: any, index: any) {
    function onFieldChangeObjectField(
      fieldBranch: string,
      fieldValue: string
    ) {
      const objectNew = { ...entry };

      objectNew[fieldBranch] = fieldValue;

      onFieldChange(branch, objectNew);
    }

    function onFieldRemoveObjectField(fieldBranch: string) {
      const objectNew = { ...entry };

      delete objectNew[fieldBranch];

      onFieldChange(branch, objectNew);
    }

    return (
      <div key={index}>
        <EditInput
          {...{
            schema,
            entry: { '|': leaf, [leaf]: entry[leaf] },
            onFieldChange: onFieldChangeObjectField,
            onFieldRemove: onFieldRemoveObjectField,
          }}
        />
      </div>
    );
  }

  async function onUseEffect() {
    const options = await queryOptions(repoRoute, branch);

    setOptions(options);
  }

  useEffect(() => {
    onUseEffect();
  }, []);

  return (
    <div>
      <div>
        object {description}
        <button
          title={t("line.button.remove", { field: branch })}
          onClick={() => onFieldRemove(branch)}
        >
          X
        </button>
      </div>

      <br />

      <div>{ entry.UUID }</div>
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

      { notAddedLeaves.length > 0 && (
        <InputDropdown {...{ schema, fields: notAddedLeaves, onFieldAdd: onAddObjectField }} />
      ) }

      { addedLeaves.map(generateLeaf) }
    </div>
  );
}
