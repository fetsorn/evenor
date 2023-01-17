import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Dropdown } from "..";

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
        const label = schema[prop]["label"];

        const lang = i18n.resolvedLanguage;

        const description = schema?.[prop]?.description?.[lang] ?? label;

        return {
          label: description,
          onClick: () => onAddProp(label),
        };
      }),

    /* react-hooks/exhaustive-deps */
    // eslint-disable-next-line
    [notAddedFields]
  );

  return (
    <>
      {menuItems.length > 0 && (
        <Dropdown
          title={t("line.dropdown.input")}
          label="+"
          menuItems={menuItems}
        />
      )}
    </>
  );
}

/* <select onChange={({ target: { value } }) => onAddProp(value)}>
          {menuItems.map((field: any, idx: any) => (
          <option key={idx} value={field.label}>
          {field.description}
          </option>
          ))}
          </select> */
