import React from "react";
import { useTranslation } from "react-i18next";

interface IHeaderGroupbyDropdownProps {
  schema: any;
  groupBy: any;
  onChangeGroupBy: any;
}

export default function HeaderGroupbyDropdown({
  schema,
  groupBy,
  onChangeGroupBy,
}: IHeaderGroupbyDropdownProps) {
  const { t } = useTranslation();

  return (
    <select
      name="HeaderGroupByDropdown"
      value={groupBy}
      title={t("header.dropdown.search", { field: groupBy })}
      onChange={({ target: { value } }) => onChangeGroupBy(value)}
    >
      {Object.keys(schema).map((field: any, idx: any) => (
        <option key={idx} value={schema[field].label}>
          {field}
        </option>
      ))}
    </select>
  );
}
