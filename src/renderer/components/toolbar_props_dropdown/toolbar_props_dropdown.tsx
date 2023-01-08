import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Dropdown } from "..";

interface IToolbarPropsDropdownProps {
  schema: any;
  entry: any;
  onAddProp: any;
}

export default function ToolbarPropsDropdown({
  schema,
  entry,
  onAddProp,
}: IToolbarPropsDropdownProps) {
  const { i18n, t } = useTranslation();

  const notAddedFields = useMemo(
    () =>
      event
        ? Object.keys(schema).filter((prop: any) => {
            return !Object.prototype.hasOwnProperty.call(
              entry,
              schema[prop]["label"]
            );
          })
        : [],
    [entry]
  );

  const menuItems = useMemo(
    () =>
      notAddedFields.map((prop: any) => {
        const label = schema[prop]["label"];

        const lang = i18n.resolvedLanguage;

        const description = schema?.[prop]?.description?.[lang] ?? label;

        return {
          label: description,
          onClick: onAddProp,
        };
      }),

    /* react-hooks/exhaustive-deps */
    // eslint-disable-next-line
    [notAddedFields]
  );

  return (
    <Dropdown
      title={t("line.dropdown.input")}
      label="+"
      menuItems={menuItems}
    />
  );
}
