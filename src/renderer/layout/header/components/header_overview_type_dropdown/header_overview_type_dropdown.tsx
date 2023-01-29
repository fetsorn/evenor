import React from "react";
import { useTranslation } from "react-i18next";
import { OverviewType, useStore } from "@/store";

export default function HeaderOverviewTypeDropdown() {
  const { t } = useTranslation();

  const [
    overviewType,
    onChangeOverviewType
  ] = useStore((state) => [
    state.overviewType,
    state.onChangeOverviewType
  ])

  return (
    <select
      name="HeaderOverviewTypeDropdown"
      value={overviewType}
      title={t("header.dropdown.search", { field: overviewType })}
      onChange={({ target: { value } }) => onChangeOverviewType(value)}
    >
      {(Object.keys(OverviewType) as Array<keyof typeof OverviewType>).map(
        (field: keyof typeof OverviewType, idx: any) => (
          <option key={idx} value={OverviewType[field]}>
            {field}
          </option>
        )
      )}
    </select>
  );
}
