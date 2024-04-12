import React from "react";
import { InputText } from "../index.js";

export function EditInput({
  schema,
  index,
  description,
  base,
  value,
  onFieldValueChange,
}) {
  // TODO: if schema[base].task === text, show this
  // <InputTextarea
  //   {...{
  //     branch,
  //     value,
  //     onFieldChange,
  //   }}
  // />
  // TODO: fetch options for base, add datalist
  return (
    <div>
      <label>{description}:</label>
      <InputText {...{ branch: base, value, onFieldChange: onFieldValueChange }} />
    </div>
  );
}
