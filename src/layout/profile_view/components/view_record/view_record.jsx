import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { ViewValue, ViewField } from "../index.js";
import { Spoiler } from "../../../../components/index.js";

export function ViewRecord({ schema, index, base, record }) {
  const { i18n } = useTranslation();

  const leaves = Object.keys(schema).filter(
    (leaf) => schema[leaf].trunk === base,
  );

  function recordHasLeaf(leaf) {
    return Object.prototype.hasOwnProperty.call(record, leaf);
  }

  const description =
    schema?.[base]?.description?.[i18n.resolvedLanguage] ?? base;

  return (
    <Spoiler
      {...{
        index,
        title: base,
        description,
      }}
    >
      <ViewValue
        {...{
          schema,
          base,
          index,
          value: record[base],
          description,
        }}
      />

      <div>
        {leaves.filter(recordHasLeaf).map((leaf, idx) => (
          <ViewField
            key={idx}
            {...{
              schema,
              index,
              base: leaf,
              value: record[leaf],
              description,
            }}
          />
        ))}
      </div>
    </Spoiler>
  );
}
