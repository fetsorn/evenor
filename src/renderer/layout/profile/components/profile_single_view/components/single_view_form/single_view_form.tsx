import React, { useMemo } from "react";
import { FormOutput } from "..";
import { useParams } from "react-router-dom";
import { dispenserUpdate } from "../../../../../../store";

interface ISingleViewFormProps {
  schema: any;
  entry: any;
}

export default function SingleViewForm({
  schema,
  entry,
}: ISingleViewFormProps) {
  const { repoRoute } = useParams();

  const addedFields = useMemo(() => (entry ? Object.keys(entry) : []), [entry]);

  return (
    <div>
      {true && (
        <a onClick={() => dispenserUpdate(repoRoute, schema, "export_root", entry)}>🔄</a>
      ) }
      {addedFields.map((label: string, index: any) => (
        <div key={index}>
          <FormOutput {...{ schema, label }} value={entry[label]} />
        </div>
      ))}
    </div>
  );
}
