import React from "react";
import { useTranslation } from "react-i18next";
import { useStore } from "../../../../../../store";

interface ISearchBarDropdownProps {
  notAddedFields: any;
}

export default function SearchBarDropdown({ notAddedFields }: ISearchBarDropdownProps) {
  const { t } = useTranslation();

  const selected = useStore((state) => state.selected)

  const onChangeSelected = useStore((state) => state.onChangeSelected)

  return (
    <select
      name="searchBarDropdown"
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
