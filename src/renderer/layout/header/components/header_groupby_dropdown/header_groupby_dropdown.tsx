import React from "react";
import { useTranslation } from "react-i18next";
import { useStore } from "@/store";

export default function HeaderGroupbyDropdown() {
  const { t } = useTranslation();

  const [
    schema,
    groupBy,
    onChangeGroupBy
  ] = useStore((state) => [
    state.schema,
    state.groupBy,
    state.onChangeGroupBy
  ])

  return (
    <select
      name="HeaderGroupByDropdown"
      value={groupBy}
      title={t("header.dropdown.search", { field: groupBy })}
      onChange={({ target: { value } }) => onChangeGroupBy(value)}
    >
      {Object.keys(schema).map((field: any, idx: any) => (
        <option key={idx} value={field}>
          {field}
        </option>
      ))}
    </select>
  );
}
