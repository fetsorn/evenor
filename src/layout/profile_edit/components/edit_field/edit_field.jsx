import React from "react";
import { useTranslation } from "react-i18next";
import { isTwig } from "@fetsorn/csvs-js";
import { EditInput, EditRecord } from "../index.js";
import { Spoiler } from "@/components/index.js";

function EditFieldItem({
  schema,
  index,
  base,
  item,
  description,
  onFieldItemChange,
  onFieldItemRemove
}) {
  const baseIsTwig = isTwig(schema, base);

  const isFile = schema[base].task === "file";

  if (baseIsTwig) {
    return (
      <EditInput
        schema={schema}
        index={index}
        base={base}
        description={description}
        value={item}
        onFieldValueChange={(_, valueNew) =>
          onFieldItemChange(valueNew)
        }
        onFieldValueRemove={() => onFieldItemRemove()}
      />
    );
  }

  return (
    <EditRecord
      index={`${index}-${item[base]}`}
      schema={schema}
      base={base}
      record={item}
      onRecordChange={(recordNew) => onFieldItemChange(recordNew)}
      onRecordRemove={() => onFieldItemRemove()}
    />
  );
}

export function EditField({
  schema,
  index,
  base,
  items,
  onFieldChange,
  onFieldRemove
}) {
  const { i18n, t } = useTranslation();

  const description =
        schema?.[base]?.description?.[i18n.resolvedLanguage] ?? base;

  function onFieldItemChange(idx, itemNew) {
    // replace the new item at index
    const itemsNew = Object.assign([], items, { [idx]: itemNew });

    onFieldChange(base, itemsNew);
  }

  function onFieldItemRemove(idx) {
    // replace the new item at index
    const itemsNew = [...items];

    itemsNew.splice(idx, 1);

    onFieldChange(base, itemsNew);
  }

  // TODO handle error when items is not array
  return (
    <Spoiler
      {...{
        index,
        title: base,
        description,
        isIgnored: items.length < 2, // only show spoiler for multiple items
        onRemove: () => onFieldRemove(),
      }}
    >
      {items.map((item, idx) => (
        <EditFieldItem
          key={idx}
          {...{
            schema,
            index,
            base,
            item,
            description,
            onFieldItemChange: (itemNew) => onFieldItemChange(idx, itemNew),
            onFieldItemRemove: () => onFieldItemRemove(idx)
          }} />
      ))}
    </Spoiler>
  );
}
