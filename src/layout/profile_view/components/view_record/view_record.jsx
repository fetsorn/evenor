import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useStore } from "@/store/index.js";
import { ViewValue, ViewField } from "../index.js";
import { Spoiler } from "@/layout/components/index.js";
import { API } from "@/api/index.js";

export function ViewRecord({ schema, index, base, record }) {
  const { i18n, t } = useTranslation();

  const [repo, recordProfile, setRepoUUID] = useStore((state) => [
    state.repo,
    state.record,
    state.setRepoUUID,
  ]);

  const { repo: repoUUID } = repo;

  const description =
    schema?.[base]?.description?.[i18n.resolvedLanguage] ?? base;

  const leaves = Object.keys(schema).filter(
    (leaf) => schema[leaf].trunk === base,
  );

  function recordHasLeaf(leaf) {
    return Object.prototype.hasOwnProperty.call(record, leaf);
  }

  const isHomeScreen = repoUUID === "root";

  const isRepo = base === "repo";

  const canZip = isHomeScreen && isRepo;

  const onZip = async () => {
    const api = new API(record.repo);

    await api.zip();
  };

  return (
    <span>
      <ViewValue
        {...{
          schema,
          base,
          index,
          value: record[base],
          description,
        }}
      />

      <span>
        {leaves.filter(recordHasLeaf).map((leaf, idx) => {
          const items = Array.isArray(record[leaf])
            ? record[leaf]
            : [record[leaf]];

          return (
            <ViewField
              key={idx}
              {...{
                schema,
                index: `${index}-${leaf}`,
                base: leaf,
                items: items,
              }}
            />
          );
        })}
      </span>

      {canZip && (
        <a title="zip" onClick={() => onZip()}>
          Can zip
        </a>
      )}
    </span>
  );
}
