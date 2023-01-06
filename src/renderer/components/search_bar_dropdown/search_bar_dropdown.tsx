import React from "react";
import { useTranslation } from "react-i18next";

interface ISearchBarDropdownProps {
  notAddedFields: any;
  selected: any;
  setSelected: any;
}

export default function SearchBarDropdown({
  notAddedFields,
  selected,
  setSelected,
}: ISearchBarDropdownProps) {
  const { t } = useTranslation();

  return (
    <select
      name="fields"
      value={selected}
      title={t("header.dropdown.search", { field: selected })}
      onChange={({ target: { value } }) => setSelected(value)}
    >
      {notAddedFields.map((field: any, idx: any) => (
        <option key={idx} value={field.name}>
          {field.name}
        </option>
      ))}
    </select>
  );
}
