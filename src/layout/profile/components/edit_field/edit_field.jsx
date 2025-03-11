import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { isTwig } from "@/store/index.js";
import { EditInput, EditRecord } from "../index.js";
import { Spoiler } from "@/layout/components/index.js";

function EditFieldItem({
  schema,
  index,
  base,
  item,
  description,
  onFieldItemChange,
  onFieldItemRemove,
}) {
  const baseIsTwig = isTwig(schema, base);

  const isFile = schema[base].task === "file";

  const [confirmation, setConfirmation] = useState(false);

  if (baseIsTwig) {
    return (
      <span>
        <EditInput
          schema={schema}
          index={index}
          base={base}
          description={description}
          value={item}
          onFieldValueChange={(_, valueNew) => onFieldItemChange(valueNew)}
          onFieldValueRemove={() => onFieldItemRemove()}
        />
      </span>
    );
  }

  return (
    <span>
      <EditRecord
        index={`${index}-${item[base]}`}
        schema={schema}
        base={base}
        record={item}
        onRecordChange={(recordNew) => onFieldItemChange(recordNew)}
        onRecordRemove={() => onFieldItemRemove()}
      />

      <span> </span>

      {confirmation ? (
        <span>
          really remove?
          <a onClick={() => onFieldItemRemove()}>Yes</a>
          <a onClick={() => setConfirmation(false)}>No</a>
        </span>
      ) : (
        <a onClick={() => setConfirmation(true)}>Remove this {base}</a>
      )}
    </span>
  );
}

export function EditField({
  schema,
  index,
  base,
  items,
  onFieldChange,
  onFieldRemove,
}) {
  const { i18n, t } = useTranslation();

  const [confirmationBulk, setConfirmationBulk] = useState(false);

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

    if (itemsNew.length === 0) {
      onFieldRemove(base);
    } else {
      onFieldChange(base, itemsNew);
    }
  }

  const Foo = (idx) => {
    const [confirmation, setConfirmation] = useState(false);

    return confirmation ? (
      <span>
        really remove?
        <a onClick={() => onFieldItemRemove(idx)}>Yes</a>
        <a onClick={() => setConfirmation(false)}>No</a>
      </span>
    ) : (
      <a onClick={() => setConfirmation(true)}>Remove this {base}</a>
    );
  };

  // TODO handle error when items is not array
  return (
    <span>
      {items.map((item, idx) => (
        <span key={idx}>
          <EditFieldItem
            {...{
              schema,
              index,
              base,
              item,
              description,
              onFieldItemChange: (itemNew) => onFieldItemChange(idx, itemNew),
              onFieldItemRemove: () => onFieldItemRemove(idx),
            }}
          />
          <span> </span>

          <Foo idx={idx} />

          <span> </span>
        </span>
      ))}

      {items.length > 1 &&
        (confirmationBulk ? (
          <span>
            really remove?
            <a onClick={() => onFieldRemove(base)}>Yes</a>
            <a onClick={() => setConfirmationBulk(false)}>No</a>
          </span>
        ) : (
          <a onClick={() => setConfirmationBulk(true)}>Remove each {base}</a>
        ))}

      <span> </span>
    </span>
  );
}
