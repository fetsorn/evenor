import React from "react";
import { InputText, InputTextarea } from "../index.js";

export function EditInput({
  schema,
  index,
  description,
  base,
  value,
  onFieldValueChange,
}) {
  // TODO: fetch options for base, add datalist

  const task = schema[base].task;

  switch (task) {
    case 'text':
      return (
        <div>
          <label>{description}:</label>
          <InputTextarea {...{ branch: base, value, onFieldChange: onFieldValueChange}}
          />
        </div>
      );

    default:
      return (
        <div>
          <label>{description}:</label>
          <InputText {...{ branch: base, value, onFieldChange: onFieldValueChange }} />
        </div>
      );
  }

}
