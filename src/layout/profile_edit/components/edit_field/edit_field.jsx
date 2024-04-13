import React from "react";
import { useTranslation } from "react-i18next";
import { EditInput, EditRecord, EditUpload } from "../index.js";
import { isTwig } from "@fetsorn/csvs-js";

export function EditField({ schema, index, base, items, onFieldChange, onFieldRemove }) {
  const { i18n, t } = useTranslation();

  const description =
    schema?.[base]?.description?.[i18n.resolvedLanguage] ?? base;

  const baseIsTwig = isTwig(schema, base);

  const task = schema[base].task;

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
    <div>
      {items.map((item, idx) => {
        if (baseIsTwig) {
          return (
            <div key={idx}>
              <EditInput
                schema={schema}
                index={index}
                base={base}
                description={description}
                value={item}
                onFieldValueChange={(_, valueNew) =>
                  onFieldItemChange(idx, valueNew)
                }
                onFieldValueRemove={() => onFieldItemRemove(idx)}
              />
            </div>
          );
        }

        if (task === "file") {
          return (
            <EditUpload
              {...{
                key: idx,
                schema,
                index: `${index}${base}${item[base]}`,
                base,
                record: item,
                onFieldChange: (_, valueNew) =>
                  onFieldItemChange(idx, valueNew),
              }}
            />
          );
        }

        return (
          <EditRecord
            index={`${index}${base}${item[base]}`}
            key={idx}
            schema={schema}
            base={base}
            record={item}
            onRecordChange={(recordNew) => onFieldItemChange(idx, recordNew)}
            onRecordRemove={() => onFieldItemRemove(idx)}
          />
        );
      })}
    </div>
  );
}
