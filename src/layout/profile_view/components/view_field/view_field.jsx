import React from "react";
import { ViewValue, ViewRecord } from "../index.js";

export function ViewField({
  schema,
  index,
  description,
  base,
  value,
}) {
  const isTrunk =
    Object.keys(schema).find((branch) => schema[branch].trunk === base) ??
    false;

  const isTwig = !isTrunk;

  // TODO handle error when value is not array

  // TODO: disambiguate on dispensers
  // if (trunk === "tags") {
  // <Suspense>
  // <Dispenser {...{ baseRecord, branchRecord: record }} />
  // </Suspense>

  // TODO: render file
  // handle file extension
  // if (branchTask === "file") {
  // return <AssetView {...{ record, schema }} />;
  // }
  // if (branchTask === "filename") {
  // return <AssetView {...{ record, schema }} />;
  // }

  return isTwig ? (
    <ViewValue
      schema={schema}
      index={index}
      base={base}
      description={description}
      // TODO: replace with sane accessor
      value={value[0][base]}
    />
  ) : (
    <div>
      {value.map((record, idx) => (
        <ViewRecord
          key={idx}
          index={`${index}${base}${record[base]}`}
          schema={schema}
          base={base}
          record={record}
        />
      ))}
    </div>
  );
}
