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

  const isBranch = base === "branch";

  // const notSingleRepo = __BUILD_MODE__ !== "server";

  // const canOpenRepo = isHomeScreen && notSingleRepo;

  const canOpenRepo = isHomeScreen && isBranch;

  const onRepoOpen = async () => {
    const repoUUIDNew = recordProfile.repo;

    const baseNew = record[base];

    setRepoUUID(repoUUIDNew, baseNew);
  };

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

      {canOpenRepo && (
        <button
          type="button"
          title={t("line.button.open")}
          onClick={() => onRepoOpen()}
        >
          {t("line.button.open")}
        </button>
      )}

      <span>
        {leaves.filter(recordHasLeaf).map((leaf, idx) => (
          <ViewField
            key={idx}
            {...{
              schema,
              index: `${index}-${leaf}`,
              base: leaf,
              items: Array.isArray(record[leaf])
                ? record[leaf]
                : [record[leaf]],
            }}
          />
        ))}
      </span>

      {canZip && (
        <button type="button" title="zip" onClick={() => onZip()}>
          zip
        </button>
      )}
    </span>
  );
}
