import React from "react";
import { useTranslation } from "react-i18next";
import { OverviewType } from "..";

interface IHeaderOverviewTypeDropdownProps {
  overviewType: any;
  onChangeOverviewType: any;
}

export default function HeaderOverviewTypeDropdown({
  overviewType,
  onChangeOverviewType,
}: IHeaderOverviewTypeDropdownProps) {
  const { t } = useTranslation();

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
