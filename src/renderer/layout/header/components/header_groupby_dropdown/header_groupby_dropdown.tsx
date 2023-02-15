import React from "react";
import { useTranslation } from "react-i18next";
import { useStore } from "@/store";

export default function HeaderGroupbyDropdown() {
  const { i18n, t } = useTranslation();

  const [
    schema,
    base,
    groupBy,
    onChangeGroupBy
  ] = useStore((state) => [
    state.schema,
    state.base,
    state.groupBy,
    state.onChangeGroupBy
  ])

  const leaves = Object.keys(schema)
    .filter((branch) => schema[branch].trunk === base || branch === base)
    .map((branch) => {
      const description = schema?.[branch]?.description?.[i18n.resolvedLanguage] ?? branch;

      return {
        branch,
        label: `${description} (${branch})`
      }
    });

  return (
    <select
      name="HeaderGroupByDropdown"
      value={groupBy}
      title={t("header.dropdown.search", { field: groupBy })}
      onChange={({ target: { value } }) => onChangeGroupBy(value)}
    >
      {leaves.map((leaf: any, idx: any) => (
        <option key={idx} value={leaf.branch}>
          {leaf.label}
        </option>
      ))}
    </select>
  );
}
