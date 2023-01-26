import React, { useMemo } from "react";
import { FormInput } from "..";
import { useStore } from "../../../../../../store";

export default function SingleEditForm() {
  const entry = useStore((state) => state.entry)

  const schema = useStore((state) => state.schema)

  const onAddProp = useStore((state) => state.onAddProp)

  const onInputUpload = useStore((state) => state.onInputUpload)

  const onInputUploadElectron = useStore((state) => state.onInputUploadElectron)

  const onInputRemove = useStore((state) => state.onInputRemove)

  const onInputChange = useStore((state) => state.onInputChange)

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
