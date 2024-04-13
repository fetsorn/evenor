import React from "react";
import { useTranslation } from "react-i18next";
import { ViewValue, ViewRecord } from "../index.js";
import { AssetView } from "../../../../components/index.js";
import { isTwig } from "@fetsorn/csvs-js";

export function ViewField({
  schema,
  index,
  base,
  items,
}) {
  const { i18n } = useTranslation();

  const baseIsTwig = isTwig(schema, base);

  const description =
    schema?.[base]?.description?.[i18n.resolvedLanguage] ?? base;

  const task = schema[base].task;

  // TODO handle error when items is not array

  // TODO: disambiguate on dispensers
  // if (trunk === "tags") {
  // <Suspense>
  // <Dispenser {...{ baseRecord, branchRecord: record }} />
  // </Suspense>

  function Foo({ item, idx }) {
    if (baseIsTwig) {
      return <ViewValue
               schema={schema}
               index={index}
               base={base}
               description={description}
               value={item}
             />
    }

    if (task === "file") {
      return <AssetView {...{ record: item, schema }} />
    }

    return <ViewRecord
             key={idx}
             index={`${index}${base}${item[base]}`}
             schema={schema}
             base={base}
             record={item}
           />
  }

  return (
    <div>
      {items.map((item, idx) => <Foo key={idx} {...{item, idx}} />)}
    </div>
  );
}
