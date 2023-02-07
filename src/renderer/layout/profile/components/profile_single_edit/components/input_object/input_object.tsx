import React, { useMemo, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { EditInput, InputPropsDropdown } from "..";
import { queryOptions } from "@/api";
import { useStore } from "@/store";

interface IInputObjectProps {
  label: any;
  description: any;
  value: any;
  schema: any;
  onFieldChange: any;
  onFieldRemove: any;
}

export default function InputObject({
  label,
  description,
  value,
  schema,
  onFieldChange,
  onFieldRemove,
}: IInputObjectProps) {
  const { t } = useTranslation();

  const [options, setOptions]: any[] = useState([]);

  const repoRoute = useStore((state) => state.repoRoute);

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

  function onAddObjectField(fieldLabel: string) {
    const objectNew = { ...value };

    objectNew[fieldLabel] = "";

    onFieldChange(label, objectNew);
  }

  async function onUseEffect() {
    const options = await queryOptions(repoRoute, label);

    setOptions(options);
  }

  useEffect(() => {
    onUseEffect();
  }, []);

  return (
    <div>
      <div>
        object {description}
        <button
          title={t("line.button.remove", { field: label })}
          onClick={() => onFieldRemove(label)}
        >
          X
        </button>
      </div>

      <br />

      <div>{ value.UUID }</div>
      { options.length > 0 && (
        <select
          value="default"
          onChange={({ target: { value } }) => {
            onFieldChange(label, JSON.parse(value))
          }}
        >
          <option hidden disabled value="default">
            {t("line.dropdown.input")}
          </option>
          {options.map((field: any, idx: any) => (
            <option key={idx} value={JSON.stringify(field)}>
              {JSON.stringify(field)}
            </option>
          ))}
        </select>
      )}

      { notAddedFields.length > 0 && (
        <InputPropsDropdown {...{ schema, notAddedFields, onFieldAdd: onAddObjectField }} />
      ) }

      { Object.keys(value)
        .filter((l) => l !== "UUID" && l !== "ITEM_NAME")
        .map((field: any, index: any) => {
          function onFieldChangeObjectField(
            fieldLabel: string,
            fieldValue: string
          ) {
            const objectNew = { ...value };

            objectNew[fieldLabel] = fieldValue;

            onFieldChange(label, objectNew);
          }

          function onFieldRemoveObjectField(fieldLabel: string) {
            const objectNew = { ...value };

            delete objectNew[fieldLabel];

            onFieldChange(label, objectNew);
          }

          return (
            <div key={index}>
              <EditInput
                {...{
                  schema,
                  onFieldChange: onFieldChangeObjectField,
                  onFieldRemove: onFieldRemoveObjectField,
                }}
                label={field}
                value={value[field]}
              />
            </div>
          );
        })
      }
    </div>
  );
}
