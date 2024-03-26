import React from "react";
import { EditInput, EditRecord } from "../index.js";

export function EditField({
  schema,
  index,
  description,
  base,
  value,
  onFieldChange,
}) {
  const isTrunk =
    Object.keys(schema).find((branch) => schema[branch].trunk === base) ??
    false;

  const isTwig = !isTrunk;

  // TODO: write onFieldAddItem and pass it to onRecordChange

  // TODO handle error when value is not array
  // TODO: disambiguate on dispensers
  return isTwig ? (
    <EditInput
      schema={schema}
      index={index}
      base={base}
      description={description}
      // TODO: replace with sane accessor
      value={value[0][base]}
      onFieldChange={onFieldChange}
    />
  ) : (
    <div key={index}>
      {value.map((record) => (
        <EditRecord
          index={`${index}${base}${record[base]}`}
          schema={schema}
          base={base}
          record={record}
          onRecordChange={onFieldChange}
        />
      ))}
    </div>
  );
}
