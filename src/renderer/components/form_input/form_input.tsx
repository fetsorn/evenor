import React, { useMemo } from "react";
import {
  FormTextareaInput,
  FormTextInput,
  FormUploadInput,
  FormDateInput,
} from "..";
import { useTranslation } from "react-i18next";

interface ISingleEditFormProps {
  schema: any;
  label: string;
  value: any;
  onInputChange: any;
  onInputRemove: any;
  onInputUpload: any;
  onInputUploadElectron: any;
}

export default function FormInput({
  schema,
  label,
  value,
  onInputChange,
  onInputRemove,
  onInputUpload,
  onInputUploadElectron,
}: ISingleEditFormProps) {
  const { i18n } = useTranslation();

  const propType = useMemo(() => {
    const prop =
      Object.keys(schema).find((p) => schema[p].label === label) ?? label;

    const propType = schema[prop]?.type;

    return propType;
  }, [schema, label]);

  const description = useMemo(() => {
    const prop = Object.keys(schema).find(
      (prop: any) => schema[prop]["label"] === label
    );

    const lang = i18n.resolvedLanguage;

    const description = schema?.[prop]?.description?.[lang] ?? label;

    return description;
  }, [schema, label]);

  switch (propType) {
    case "array":
      return (
        <div>
          <div>array {description}</div>
          {value.items.map((item: any, index: any) => {
            function onInputChangeArray(
              fieldLabel: string,
              fieldValue: string
            ) {
              const itemNew = { ...item };

              itemNew[fieldLabel] = fieldValue;

              const itemsNew = value.items.filter(
                (i: any) => i.UUID !== item.UUID
              );

              itemsNew.push(itemNew);

              const arrayNew = { UUID: value.UUID, items: itemsNew };

              onInputChange(label, arrayNew);
            }

            function onInputRemoveArray(fieldLabel: string) {
              const itemNew = { ...item };

              delete itemNew[fieldLabel];

              const itemsNew = value.items.filter(
                (i: any) => i.UUID !== item.UUID
              );

              itemsNew.push(itemNew);

              const arrayNew = { UUID: value.UUID, items: itemsNew };

              onInputChange(label, arrayNew);
            }

            return (
              <div key={index}>
                <FormInput
                  {...{
                    schema,
                    onInputChange: onInputChangeArray,
                    onInputRemove: onInputRemoveArray,
                    onInputUpload,
                    onInputUploadElectron,
                  }}
                  label={item.ITEM_NAME}
                  value={item}
                />
              </div>
            );
          })}
        </div>
      );

    case "object":
      return (
        <div>
          <div>
            object {description} {value.UUID}
          </div>
          {Object.keys(value)
            .filter((l) => l !== "UUID" && l !== "ITEM_NAME")
            .map((field: any, index: any) => (
              <div key={index}>
                <FormInput
                  {...{
                    schema,
                    onInputChange,
                    onInputRemove,
                    onInputUpload,
                    onInputUploadElectron,
                  }}
                  label={field}
                  value={value[field]}
                />
              </div>
            ))}
        </div>
      );

    case "text":
    case "schema":
      return (
        <FormTextareaInput
          {...{
            description,
            label,
            value,
            onInputChange,
            onInputRemove,
          }}
        />
      );

    case "date":
      return (
        <FormDateInput
          {...{
            description,
            label,
            value,
            onInputChange,
            onInputRemove,
          }}
        />
      );

    case "path":
      return (
        <FormUploadInput
          {...{
            description,
            label,
            onInputUpload,
            onInputUploadElectron,
          }}
        />
      );

    default:
      return (
        <FormTextInput
          {...{
            description,
            label,
            value,
            onInputChange,
            onInputRemove,
          }}
        />
      );
  }
}
