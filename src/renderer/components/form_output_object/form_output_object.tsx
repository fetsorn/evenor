import React from "react";
import { FormOutputParagraph, getDescription } from "..";

interface IFormOutputObjectProps {
  schema: any;
  description: string;
  value: any;
}

export default function FormOutputObject({
  schema,
  description,
  value,
}: IFormOutputObjectProps) {
  return (
    <div>
      <div>object {description}</div>
      {Object.keys(value).map((field: any, index: any) => {
        return (
          <div key={index}>
            <FormOutputParagraph
              description={getDescription(schema, field)}
              value={value[field]}
            />
          </div>
        );
      })}
    </div>
  );
}
