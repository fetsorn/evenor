import { useEffect, useState, useMemo } from "react";

export default function SearchBarDropdown() {
  return (
    <select
      name="fields"
      value={selected}
      title={t("header.dropdown.search", { field: selected })}
      onChange={({ target: { value } }) => setSelected(value)}
    >
      {notAddedFields.map((field: any, idx: any) => (
        <option key={idx} value={field.name}>
          {field.name}
        </option>
      ))}
    </select>
  );
}
