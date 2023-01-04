import React from "react";
import { Paragraph, FormOutput } from "..";
import { description, value } from "./single_view_form";

interface ISingleViewFormProps {
  schema: any;
  entry: any;
  addedFields: any;
}

export default function SingleViewForm({
  schema,
  entry,
  addedFields,
}: ISingleViewFormProps) {
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
