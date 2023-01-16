import React from "react";
import { useTranslation } from "react-i18next";

interface ISearchBarDropdownProps {
  notAddedFields: any;
  selected: any;
  onChangeSelected: any;
}

export default function SearchBarDropdown({
  notAddedFields,
  selected,
  onChangeSelected,
}: ISearchBarDropdownProps) {
  const { t } = useTranslation();

  return (
    <select
      name="fields"
      value={selected}
      title={t("header.dropdown.search", { field: selected })}
      onChange={({ target: { value } }) => onChangeSelected(value)}
    >
      {notAddedFields.map((field: any, idx: any) => (
        <option key={idx} value={field.name}>
          {field.name}
        </option>
      ))}
    </select>
  );
}
