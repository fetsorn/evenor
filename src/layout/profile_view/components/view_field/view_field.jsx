import React from "react";
import { useTranslation } from "react-i18next";
import { ViewValue, ViewRecord, ViewRemote, ViewSync } from "../index.js";
import { AssetView } from "@/components/index.js";
import { useStore } from "@/store/index.js";
import { isTwig } from "@fetsorn/csvs-js";

export function ViewField({ schema, index, base, items }) {
  const [ record, repoUUID ] = useStore((state) => [ state.record, state.repoUUID ]);

  const { i18n } = useTranslation();

  const baseIsTwig = isTwig(schema, base);

  const isHomeScreen = repoUUID === "root";

  const description =
    schema?.[base]?.description?.[i18n.resolvedLanguage] ?? base;

  const task = schema[base].task;

  const isRemote = isHomeScreen && task === "remote";

  const isSync = isHomeScreen && task === "sync";

  function Foo({ item, idx }) {
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

    if (task === "file") {
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
        key={idx}
        index={`${index}${base}${item[base]}`}
        schema={schema}
        base={base}
        record={item}
      />
    );
  }

  // TODO handle error when items is not array
  return (
    <div>
      {items.map((item, idx) => (
        <Foo key={idx} {...{ item, idx }} />
      ))}
    </div>
  );
}
