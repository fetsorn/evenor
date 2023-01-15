import React, { useMemo } from "react";
import { FormOutput, FormInput } from "..";

interface ISingleEditFormProps {
  schema: any;
  entry: any;
  onInputChange: any;
  onInputRemove: any;
  onInputUpload: any;
  onInputUploadElectron: any;
}

export default function SingleEditForm({
  schema,
  entry,
  onInputChange,
  onInputRemove,
  onInputUpload,
  onInputUploadElectron,
}: ISingleEditFormProps) {
  const addedFields = useMemo(
    () =>
      entry ? Object.keys(entry).filter((prop: any) => prop != "UUID") : [],
    [entry]
  );

  return (
    <>
      {entry && schema && (
        <div>
          <FormOutput {...{ schema }} label="UUID" value={entry.UUID} />
          <form>
            {addedFields.map((label: any, index: any) => (
              <div key={index}>
                <FormInput
                  {...{
                    schema,
                    label,
                    onInputChange,
                    onInputRemove,
                    onInputUpload,
                    onInputUploadElectron,
                  }}
                  value={entry[label]}
                />
              </div>
            ))}
          </form>
        </div>
      )}
    </>
  );
}
