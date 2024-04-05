import React from "react";
import { useTranslation } from "react-i18next";
import { useStore } from "../../../../../../store/index.js";
import styles from "./filter_base_select.module.css";


export function FilterBaseSelect({}) {
  const { i18n, t } = useTranslation();

  const [base, queries, schema, setBase] = useStore((state) => [
    state.base,
    state.queries,
    state.schema,
    state.setBase,
  ]);

  // const schemaBase = Object.fromEntries(
  //   Object.entries(schema).filter(
  //     ([branch, info]) =>
  //     branch === base ||
  //       info.trunk === base ||
  //       schema[info.trunk]?.trunk === base,
  //   ),
  // );

  const baseDefault = Object.prototype.hasOwnProperty.call(schema, queries._)
        ? queries._
        : Object.keys(schema).find(
          (branch) =>
          !Object.prototype.hasOwnProperty.call(schema[branch], "trunk"),
        );

  const options = Object.keys(schema);

  return (
    <label htmlFor={`selectBase`}>
      {t("header.dropdown.base")}
      <select
        id={`selectBase`}
        value={base ?? baseDefault}
        onChange={({ target: { value } }) => {
          setBase(value);
        }}
      >
        {options.map((field) => (
          <option
            key={crypto.getRandomValues(new Uint32Array(10)).join("")}
            value={field}
          >
            {field}
          </option>
        ))}
      </select>
    </label>
  );
}
