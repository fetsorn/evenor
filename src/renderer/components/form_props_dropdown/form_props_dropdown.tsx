import React from "react";

export default function DropdownProps({
  schema: any,
  notAddedFields: any,
  event: any,
  setEvent: any,
}) {
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
    <DropdownMenu
      title={t("line.dropdown.input")}
      label="+"
      menuItems={menuItems}
    />
  );
}
