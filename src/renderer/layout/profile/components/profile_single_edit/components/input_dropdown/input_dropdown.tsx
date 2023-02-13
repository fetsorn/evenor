import React from "react";
import { useTranslation } from "react-i18next";

interface IInputDropdownProps {
  schema: any;
  fields: any;
  onFieldAdd: any;
}

export default function InputDropdown({
  schema,
  fields,
  onFieldAdd,
}: IInputDropdownProps) {
  const { i18n, t } = useTranslation();

  const lang = i18n.resolvedLanguage;

  const menuItems = fields.map((branch: any) => {

    const description = schema?.[branch]?.description?.[lang] ?? branch;

    return {
      branch,
      description,
    };
  });

  return (
    <>
      {menuItems.length > 0 && (
        <select
          value="default"
          onChange={({ target: { value } }) => onFieldAdd(value)}
        >
          <option hidden disabled value="default">
            {t("line.dropdown.input")}
          </option>
          {menuItems.map((field: any, idx: any) => (
            <option key={idx} value={field.branch}>
              {field.description}
            </option>
          ))}
        </select>
      )}
    </>
  );
}
