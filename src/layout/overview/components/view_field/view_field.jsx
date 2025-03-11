import React from "react";
import { useTranslation } from "react-i18next";
import { ViewValue, ViewRecord, ViewRemote, ViewSync } from "../index.js";
import { AssetView, Spoiler } from "@/layout/components/index.js";
import { useStore, isTwig } from "@/store/index.js";

function ViewFieldItem({ schema, baseRecord, index, base, item, description }) {
  const [record, { repo: repoUUID }] = useStore((state) => [
    state.record,
    state.repo,
  ]);

  const isHomeScreen = repoUUID === "root";

  const task = schema[base].task;

  const isFile = task === "file";

  const isRemote = isHomeScreen && task === "remote";

  const isSync = isHomeScreen && task === "sync";

  const baseIsTwig = isTwig(schema, base);

  if (baseIsTwig) {
    return (
      <ViewValue
        schema={schema}
        index={index}
        base={base}
        description={description}
        value={item}
      />
    );
  }

  if (isFile) {
    return <AssetView {...{ record: item, schema }} />;
  }

  if (isRemote) {
    return <ViewRemote {...{ baseRecord, branchRecord: item }} />;
  }

  if (isSync) {
    return <ViewSync {...{ schema, baseRecord, branchRecord: item }} />;
  }

  return (
    <ViewRecord
      index={`${index}-${item[base]}`}
      baseRecord={baseRecord}
      schema={schema}
      base={base}
      record={item}
    />
  );
}

export function ViewField({ schema, baseRecord, index, base, items }) {
  const { i18n, t } = useTranslation();

  const [repo, setRepoUUID] = useStore((state) => [
    state.repo,
    state.setRepoUUID,
  ]);

  const { repo: repoUUID } = repo;

  const description =
    schema?.[base]?.description?.[i18n.resolvedLanguage] ?? base;

  const isHomeScreen = repoUUID === "root";

  // const notSingleRepo = __BUILD_MODE__ !== "server";

  // const canOpenRepo = isHomeScreen && notSingleRepo;

  const isBranch = base === "branch";

  const canOpenRepo = isHomeScreen && isBranch;

  const onRepoOpen = async (itemBase) => {
    const baseNew = itemBase;

    setRepoUUID(baseRecord.repo, baseNew);
  };

  // TODO handle error when items is not array
  return (
    <span>
      {canOpenRepo && (
        <span>
          {t("line.button.open")}
          <span> </span>
          {items.map((item, idx) => (
            <span key={idx}>
              <a
                title={t("line.button.open")}
                onClick={() => onRepoOpen(item[base])}
              >
                {item[base]}
              </a>

              <span> </span>
            </span>
          ))}
        </span>
      )}

      <Spoiler {...{ index, title: "", description }}>
        {items.map((item, idx) => (
          <ViewFieldItem
            key={idx}
            {...{
              schema,
              index,
              baseRecord,
              base,
              item,
              description,
            }}
          />
        ))}
      </Spoiler>
    </span>
  );
}
