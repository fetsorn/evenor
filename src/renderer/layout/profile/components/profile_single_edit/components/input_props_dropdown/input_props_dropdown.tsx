import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

interface IInputPropsDropdownProps {
  schema: any;
  notAddedFields: any;
  onAddProp: any;
}

export default function InputPropsDropdown({
  schema,
  notAddedFields,
  onAddProp,
}: IInputPropsDropdownProps) {
  const { i18n, t } = useTranslation();

  const menuItems = useMemo(
    () =>
      notAddedFields.map((prop: any) => {
        const label = schema[prop].label;

        const lang = i18n.resolvedLanguage;

        const description = schema?.[prop]?.description?.[lang] ?? label;

        return {
          label,
          description,
        };
      }),

    /* react-hooks/exhaustive-deps */
    // eslint-disable-next-line
    [notAddedFields]
  );

  return (
    <>
      {menuItems.length > 0 && (
        <select
          value="default"
          onChange={({ target: { value } }) => onAddProp(value)}
        >
          <option hidden disabled value="default">
            {t("line.dropdown.input")}
          </option>
          {menuItems.map((field: any, idx: any) => (
            <option key={idx} value={field.label}>
              {field.description}
            </option>
          ))}
        </select>
      )}
    </>
  );
}
