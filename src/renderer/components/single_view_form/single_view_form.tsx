import React, { useMemo } from "react";
import { Paragraph, FormOutput } from "..";
import { description, value } from "./tbn";

interface ISingleViewFormProps {
  schema: any;
  entry: any;
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
