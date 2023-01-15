import React from "react";
import { FormOutputObject, getDescription } from "..";

interface IFormOutputArrayProps {
  schema: any;
  description: string;
  value: any;
}

export default function FormOutputArray({
  schema,
  description,
  value,
}: IFormOutputArrayProps) {
  return (
    <div>
      <div>array {description} </div>
      {value.items.map((item: any, index: any) => (
        <div key={index}>
          <FormOutputObject
            {...{ schema }}
            description={getDescription(schema, item.ITEM_NAME)}
            value={item}
          />
        </div>
      ))}
    </div>
  );
}
