import React, { useMemo } from "react";
import { Paragraph, FormOutput } from "..";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

interface ISingleViewFormProps {
  schema: any;
  entry: any;
}

export function description(schema: any, dir: string, label: any) {
  const prop = Object.keys(schema).find(
    (prop: any) => schema[prop]["label"] === label
  );

  const { i18n } = useTranslation();

  const lang = i18n.resolvedLanguage;

  const description = schema?.[prop]?.description?.[lang] ?? label;

  return description;
}

export default function SingleViewForm({
  schema,
  entry,
}: ISingleViewFormProps) {
  const { repoRoute } = useParams();

  const addedFields = useMemo(
    () =>
      entry ? Object.keys(entry).filter((prop: any) => prop != "UUID") : [],
    [entry]
  );

  return (
    <div>
      <Paragraph>{entry?.UUID}</Paragraph>

      <div>
        {addedFields.map((label: string, index: any) => (
          <div key={index}>
            <FormOutput
              description={description(schema, repoRoute, label)}
              value={entry[label]}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
