import React from "react";

export default function HeaderGroupByDropdown({
  groupBy: any,
  setGroupBy: any,
  schema: any,
}) {
  return (
    <select
      name="fields"
      value={groupBy}
      title={t("header.dropdown.groupBy", { field: groupBy })}
      onChange={({ target: { value } }) => setGroupBy(value)}
    >
      {Object.keys(schema).map((prop: any, idx: any) => {
        if (schema[prop]["type"] == "date") {
          return (
            <option key={idx} value={prop}>
              {prop}
            </option>
          );
        }
      })}
    </select>
  );
}
