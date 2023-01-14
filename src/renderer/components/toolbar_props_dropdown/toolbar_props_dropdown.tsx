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

  // always list array items
  // list schema props that are not in the entry
  // never list arrays or object fields
  const notAddedFields = useMemo(
    () =>
      entry
        ? Object.keys(schema).filter((prop: any) => {
            return (
              schema[schema[prop].trunk]?.type === "array" ||
              (!Object.prototype.hasOwnProperty.call(
                entry,
                schema[prop].label
              ) &&
                schema[prop].type !== "array" &&
                schema[schema[prop].trunk]?.type !== "object")
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
