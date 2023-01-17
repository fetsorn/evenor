import React, { useMemo } from "react";
import { FormInput, InputPropsDropdown } from "..";
import { useTranslation } from "react-i18next";

interface IInputObjectProps {
  label: any;
  description: any;
  value: any;
  schema: any;
  onInputChange: any;
  onInputRemove: any;
}

export default function InputObject({
  label,
  description,
  value,
  schema,
  onInputChange,
  onInputRemove,
}: IInputObjectProps) {
  const { t } = useTranslation();

  const notAddedFields = useMemo(
    () =>
      value
        ? Object.keys(schema).filter((prop: any) => {
            const { trunk } = schema[prop];

            const trunkIsValue = trunk === value.ITEM_NAME;

            const valueHasField = Object.prototype.hasOwnProperty.call(
              value,
              schema[prop].label
            );

            return trunkIsValue && !valueHasField;
          })
        : [],
    [value]
  );

  function onAddProp(fieldLabel: string) {
    const objectNew = { ...value };

    objectNew[fieldLabel] = "";

    onInputChange(label, objectNew);
  }

  return (
    <div>
      <label>
        array {description}
        <button
          title={t("line.button.remove", { field: label })}
          onClick={() => onInputRemove(label)}
        >
          X
        </button>
      </label>

      <InputPropsDropdown {...{ schema, notAddedFields, onAddProp }} />

      {Object.keys(value)
        .filter((l) => l !== "UUID" && l !== "ITEM_NAME")
        .map((field: any, index: any) => {
          function onInputChangeObjectField(
            fieldLabel: string,
            fieldValue: string
          ) {
            const objectNew = { ...value };

            objectNew[fieldLabel] = fieldValue;

            onInputChange(label, objectNew);
          }

          function onInputRemoveObjectField(fieldLabel: string) {
            const objectNew = { ...value };

            delete objectNew[fieldLabel];

            onInputChange(label, objectNew);
          }

          return (
            <div key={index}>
              <FormInput
                {...{
                  schema,
                  onInputChange: onInputChangeObjectField,
                  onInputRemove: onInputRemoveObjectField,
                }}
                label={field}
                value={value[field]}
              />
            </div>
          );
        })}
    </div>
  );
}
