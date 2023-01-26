import React, { useMemo } from "react";
import { FormInput } from "..";

export default function SingleEditForm() {
  const addedFields = useMemo(() => (entry ? Object.keys(entry) : []), [entry]);

  // always list array items
  // list schema props that are not in the entry
  // never list arrays or object fields
  const notAddedFields = useMemo(
    () =>
      entry
        ? Object.keys(schema).filter((prop: any) => {
            return (
              schema[schema[prop].trunk]?.type === "array" ||
              (!Object.prototype.hasOwnProperty.call(
                entry,
                schema[prop].label
              ) &&
                schema[prop].type !== "array" &&
                schema[schema[prop].trunk]?.type !== "object")
            );
          })
        : [],
    [entry]
  );

  return (
    <>
      {entry && schema && (
        <div>
          <div>
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
                    onAddProp,
                    notAddedFields,
                  }}
                  value={entry[label]}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
