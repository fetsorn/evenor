import React, { useMemo } from "react";
import {
  FormOutputParagraph,
  FormOutputArray,
  FormOutputObject,
  getDescription,
} from "..";

interface ISingleViewFormProps {
  schema: any;
  entry: any;
}

export default function SingleViewForm({
  schema,
  entry,
}: ISingleViewFormProps) {
  const addedFields = useMemo(() => (entry ? Object.keys(entry) : []), [entry]);

  return (
    <div>
      {addedFields.map((label: string, index: any) => {
        const prop =
          Object.keys(schema).find((p) => schema[p].label === label) ?? label;

        const propType = schema[prop]?.type;

        const description = getDescription(schema, label);

        const value = entry[label];

        return (
          <div key={index}>
            {propType === "array" ? (
              <FormOutputArray {...{ schema, description, value }} />
            ) : propType === "object" ? (
              <FormOutputObject {...{ schema, description, value }} />
            ) : (
              <FormOutputParagraph {...{ schema, description, value }} />
            )}
          </div>
        );
      })}
    </div>
  );
}
