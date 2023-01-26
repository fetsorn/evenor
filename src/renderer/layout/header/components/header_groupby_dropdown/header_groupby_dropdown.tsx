import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import { useStore } from "../../../../store";

export default function HeaderGroupbyDropdown() {
  const { t } = useTranslation();

  const navigate = useNavigate();

  const location = useLocation();

  const schema = useStore((state) => state.schema)

  const groupBy = useStore((state) => state.groupBy)

  const onChangeGroupBy = useStore((state) => state.onChangeGroupBy)

  return (
    <select
      name="HeaderGroupByDropdown"
      value={groupBy}
      title={t("header.dropdown.search", { field: groupBy })}
      onChange={({ target: { value } }) => onChangeGroupBy(navigate, location.search, value)}
    >
      {Object.keys(schema).map((field: any, idx: any) => (
        <option key={idx} value={schema[field].label}>
          {field}
        </option>
      ))}
    </select>
  );
}
