import React from "react";
import { useTranslation } from "react-i18next";
import { EditInput, EditRecord } from "../index.js";
import { isTwig } from "@fetsorn/csvs-js";

export function EditField({
  schema,
  index,
  base,
  items,
  onFieldChange,
}) {
  const { i18n } = useTranslation();

  const description =
    schema?.[base]?.description?.[i18n.resolvedLanguage] ?? base;

  const baseIsTwig = isTwig(schema, base);

  function onFieldItemChange(index, itemNew) {
    // replace the new item at index
    const itemsNew = Object.assign([], items, {[index]: itemNew});

    onFieldChange(base, itemsNew);
  }

  // TODO handle error when items is not array
  return (
    <div>
    {items.map((item, idx) => baseIsTwig
                ? <EditInput
                    key={idx}
                    schema={schema}
                    index={index}
                    base={base}
                    description={description}
                    value={item}
                    onFieldValueChange={(_, valueNew) => onFieldItemChange(idx, valueNew)}
                  />
                : <EditRecord
                    key={idx}
                    index={`${index}${base}${item[base]}`}
                    schema={schema}
                    base={base}
                    record={item}
                    onRecordChange={(recordNew) => onFieldItemChange(idx, recordNew)}
                />)}
    </div>

  )
}
