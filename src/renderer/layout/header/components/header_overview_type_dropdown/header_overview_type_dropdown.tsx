import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import { OverviewType, useStore } from "../../../../store";

export default function HeaderOverviewTypeDropdown() {
  const { t } = useTranslation();

  const navigate = useNavigate();

  const location = useLocation();

  const overviewType = useStore((state) => state.overviewType)

  const onChangeOverviewType = useStore((state) => state.onChangeOverviewType)

  return (
    <select
      name="HeaderOverviewTypeDropdown"
      value={overviewType}
      title={t("header.dropdown.search", { field: overviewType })}
      onChange={({ target: { value } }) => onChangeOverviewType(navigate, location.search, value)}
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
