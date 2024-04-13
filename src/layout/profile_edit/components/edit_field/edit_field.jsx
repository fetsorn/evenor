import React from "react";
import { useTranslation } from "react-i18next";
import { EditInput, EditRecord, EditUpload } from "../index.js";
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

  const task = schema[base].task;

  function onFieldItemChange(index, itemNew) {
    // replace the new item at index
    const itemsNew = Object.assign([], items, {[index]: itemNew});

    onFieldChange(base, itemsNew);
  }

  function Foo({ item, idx }) {
    if (baseIsTwig) {
      return <EditInput
               schema={schema}
               index={index}
               base={base}
               description={description}
               value={item}
               onFieldValueChange={(_, valueNew) => onFieldItemChange(idx, valueNew)}
             />
    }

    if (task === "file") {
      return <EditUpload {...{
        schema,
        index: `${index}${base}${item[base]}`,
        base,
        record: item,
        onFieldChange: (_, valueNew) => onFieldItemChange(idx, valueNew)
      }} />
    }

    return <EditRecord
             index={`${index}${base}${item[base]}`}
             schema={schema}
             base={base}
             record={item}
             onRecordChange={(recordNew) => onFieldItemChange(idx, recordNew)}
           />
  }

  // TODO handle error when items is not array
  return (
    <div>
      {items.map((item, idx) =>  <Foo key={idx} {...{item, idx}}/>)}
    </div>

  )
}
