import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Dropdown } from "..";

interface IFormPropsDropdownProps {
  schema: any;
  notAddedFields: any;
  event: any;
  setEvent: any;
}

export default function FormPropsDropdown({
  schema,
  notAddedFields,
  event,
  setEvent,
}: IFormPropsDropdownProps) {
  const { i18n, t } = useTranslation();

  const menuItems = useMemo(
    () =>
      notAddedFields.map((prop: any) => {
        const label = schema[prop]["label"];

        const lang = i18n.resolvedLanguage;

        const description = schema?.[prop]?.description?.[lang] ?? label;

        return {
          label: description,

          onClick: () => {
            const e = { ...event };

            e[label] = "";

            setEvent(e);
          },
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
