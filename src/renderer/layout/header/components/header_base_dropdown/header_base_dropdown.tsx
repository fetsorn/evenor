import React from "react";
import { useTranslation } from "react-i18next";
import { useStore } from "@/store";

export default function HeaderBaseDropdown() {
  const { t } = useTranslation();

  const [
    schema,
    base,
    onChangeBase
  ] = useStore((state) => [
    state.schema,
    state.base,
    state.onChangeBase
  ])

  const roots = Object.keys(schema)
    .filter((branch) =>
      schema[branch].trunk === undefined || schema[branch].type === 'object');

  return (
    <select
      name="HeaderBaseDropdown"
      value={base}
      title={t("header.dropdown.search", { field: base })}
      onChange={({ target: { value } }) => onChangeBase(value)}
    >
      {roots.map((field: any, idx: any) => (
        <option key={idx} value={field}>
          {field}
        </option>
      ))}
    </select>
  );
}
