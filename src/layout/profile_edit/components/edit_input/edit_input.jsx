import React from "react";
import { useTranslation } from "react-i18next";
import { InputText, InputTextarea, InputContenteditable } from "../index.js";

export function EditInput({
  schema,
  index,
  description,
  base,
  value,
  onFieldValueChange,
  onFieldValueRemove,
}) {
  const { i18n, t } = useTranslation();

  const task = schema[base].task;

  switch (task) {
    case "text":
      return (
        <span>
          <label>The {description} is </label>
          {/* {onFieldValueRemove && ( */}
          {/*   <a */}
          {/*     title={t("line.button.remove", { field: base })} */}
          {/*     onClick={() => onFieldValueRemove()} */}
          {/*   > */}
          {/*     Remove this {base} */}
          {/*     <span> </span> */}
          {/*   </a> */}
          {/* )} */}
          <InputContenteditable
            {...{ branch: base, value, onFieldChange: onFieldValueChange }}
          />
        </span>
      );

    default:
      return (
        <span>
          <label>The {description} is </label>
          {/* {onFieldValueRemove && ( */}
          {/*   <a */}
          {/*     title={t("line.button.remove", { field: base })} */}
          {/*     onClick={() => onFieldValueRemove()} */}
          {/*   > */}
          {/*     Remove this {base} */}
          {/*     <span> </span> */}
          {/*   </a> */}
          {/* )} */}
          <InputContenteditable
            {...{ branch: base, value, onFieldChange: onFieldValueChange }}
          />
        </span>
      );
  }
}
