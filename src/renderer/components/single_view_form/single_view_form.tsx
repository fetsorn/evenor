import React, { useMemo } from "react";
import { Paragraph, FormOutput, fetchSchema } from "..";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

interface ISingleViewFormProps {
  entry: any;
}

export async function description(dir: string, label: any) {
  const { i18n } = useTranslation();

  const schema: any = await fetchSchema(dir);

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

export default function SingleViewForm({ entry }: ISingleViewFormProps) {
  const { repoRoute } = useParams();

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
              description={description(repoRoute, label)}
              value={value(event, label)}
            />
          ))}
        </div>
      )}
    </>
  );
}
