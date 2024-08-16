import React from "react";
import { useTranslation } from "react-i18next";
import { ViewValue, ViewRecord, ViewRemote, ViewSync } from "../index.js";
import { AssetView, Spoiler } from "@/layout/components/index.js";
import { useStore } from "@/store/index.js";
import { isTwig } from "@fetsorn/csvs-js";

function ViewFieldItem({ schema, index, base, item, description }) {
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
    return <ViewRemote {...{ baseRecord: record, branchRecord: item }} />;
  }

  if (isSync) {
    return <ViewSync {...{ baseRecord: record, branchRecord: item }} />;
  }

  return (
    <ViewRecord
      index={`${index}-${item[base]}`}
      schema={schema}
      base={base}
      record={item}
    />
  );
}

export function ViewField({ schema, index, base, items }) {
  const { i18n } = useTranslation();

  const description =
    schema?.[base]?.description?.[i18n.resolvedLanguage] ?? base;

  // TODO handle error when items is not array
  return (
    <span>
      {items.map((item, idx) => (
        <ViewFieldItem
          key={idx}
          {...{
            schema,
            index,
            base,
            item,
            description,
          }}
        />
      ))}
    </span>
  );
}
