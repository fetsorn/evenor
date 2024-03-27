import React from "react";
import { useTranslation } from "react-i18next";
import { EditInput, EditRecord } from "../index.js";

export function EditField({
  schema,
  index,
  base,
  value,
  onFieldChange,
}) {
  const { i18n } = useTranslation();

  const description =
    schema?.[base]?.description?.[i18n.resolvedLanguage] ?? base;

  const isTrunk =
    Object.keys(schema).find((branch) => schema[branch].trunk === base) ??
    false;

  const isTwig = !isTrunk;

  // TODO: write onFieldAddItem and pass it to onRecordChange

  // TODO handle error when value is not array
  return isTwig ? (
    <EditInput
      schema={schema}
      index={index}
      base={base}
      description={description}
      // TODO: replace with sane accessor
      value={Array.isArray(value) ? value[0][base] : value[base]}
      onFieldChange={onFieldChange}
    />
  ) : (
    <div>
      {value.map((record, idx) => (
        <EditRecord
          key={idx}
          index={`${index}${base}${record[base]}`}
          schema={schema}
          base={base}
          record={record}
          onRecordChange={(recordNew) => onFieldChange(base, recordNew)}
        />
      ))}
    </div>
  );
}
