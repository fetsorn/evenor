import React, { useMemo } from "react";
import { Paragraph, FormOutput } from "..";
import { useTranslation } from "react-i18next";

interface ISingleViewFormProps {
  schema: any;
  entry: any;
}

export function description(schema: any, label: any) {
  const { i18n } = useTranslation();

  const prop = Object.keys(schema).find(
    (prop: any) => schema[prop]["label"] === label
  );

  const lang = i18n.resolvedLanguage;

  const description = schema?.[prop]?.description?.[lang] ?? label;

  return description;
}

export function value(event: any, label: any) {
  event[label];
}

export default function SingleViewForm({
  schema,
  entry,
}: ISingleViewFormProps) {
  const addedFields = useMemo(
    () =>
      entry ? Object.keys(entry).filter((prop: any) => prop != "UUID") : [],
    [entry]
  );

  return (
    <>
      {entry && (
        <div>
          <Paragraph>{entry?.UUID}</Paragraph>

          {addedFields.map((label: any, index: any) => (
            <FormOutput
              {...{ description, value, index }}
              description={description(schema, label)}
              value={value(event, label)}
            />
          ))}
        </div>
      )}
    </>
  );
}
