import React, { useMemo } from "react";
import { FormOutput } from "..";
import { useParams } from "react-router-dom";
import { dispenserUpdate , useStore } from "../../../../../../store";

export default function SingleViewForm() {
  const { repoRoute } = useParams();

  const entry = useStore((state) => state.entry)

  const schema = useStore((state) => state.schema)

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
