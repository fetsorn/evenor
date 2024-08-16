import React from "react";
import { useTranslation } from "react-i18next";
import { InputText, InputTextarea } from "../index.js";

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
          <label>{description}:</label>
          {onFieldValueRemove && (
            <button
              type="button"
              title={t("line.button.remove", { field: base })}
              onClick={() => onFieldValueRemove()}
            >
              X
            </button>
          )}
          <InputTextarea
            {...{ branch: base, value, onFieldChange: onFieldValueChange }}
          />
        </span>
      );

    default:
      return (
        <span>
          <label>{description}:</label>
          {onFieldValueRemove && (
            <button
              type="button"
              title={t("line.button.remove", { field: base })}
              onClick={() => onFieldValueRemove()}
            >
              X
            </button>
          )}
          <InputText
            {...{ branch: base, value, onFieldChange: onFieldValueChange }}
          />
        </span>
      );
  }
}
