import React, { useMemo } from "react";
import { FormInput } from "..";

interface ISingleEditFormProps {
  schema: any;
  entry: any;
  onInputChange: any;
  onInputRemove: any;
  onInputUpload: any;
  onInputUploadElectron: any;
  onAddProp: any;
}

export default function SingleEditForm({
  schema,
  entry,
  onInputChange,
  onInputRemove,
  onInputUpload,
  onInputUploadElectron,
  onAddProp,
}: ISingleEditFormProps) {
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
          <form name="single_edit_form">
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
          </form>
        </div>
      )}
    </>
  );
}
