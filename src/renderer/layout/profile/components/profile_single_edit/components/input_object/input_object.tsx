import React, { useMemo, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { EditInput, InputPropsDropdown } from "..";
import { useTranslation } from "react-i18next";
import { queryOptions } from "../../../../../../store";

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

  const { repoRoute } = useParams();

  const [options, setOptions]: any[] = useState([]);

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

    onInputChange(label, objectNew);
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
      <label>
        object {description}
        <button
          title={t("line.button.remove", { field: label })}
          onClick={() => onInputRemove(label)}
        >
          X
        </button>
      </label>

      <br />

      <div>{value.UUID}</div>
      { options && (
        <select
          value="default"
          onChange={({ target: { value } }) => {
            onInputChange(label, JSON.parse(value))
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

      <InputPropsDropdown
        {...{ schema, notAddedFields, onAddProp: onAddObjectField }}
      />

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
              <EditInput
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
