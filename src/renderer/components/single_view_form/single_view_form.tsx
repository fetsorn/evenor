import React, { useMemo } from "react";
import { FormOutput } from "..";

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
      {addedFields.map((label: string, index: any) => (
        <div key={index}>
          <FormOutput {...{ schema, label }} value={entry[label]} />
        </div>
      ))}
    </div>
  );
}
