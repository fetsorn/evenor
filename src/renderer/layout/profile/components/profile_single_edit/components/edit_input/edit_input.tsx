import React, { useMemo } from "react";
import {
  InputTextarea,
  InputText,
  InputUpload,
  InputDate,
  InputPropsDropdown,
  InputArray,
  InputObject,
} from "..";
import { useTranslation } from "react-i18next";

interface IEditInputProps {
  schema: any;
  label: string;
  value: any;
  onFieldChange?: any;
  onFieldRemove?: any;
  onFieldUpload?: any;
  onFieldUploadElectron?: any;
  onFieldAdd?: any;
  notAddedFields?: any;
}

export default function EditInput({
  schema,
  label,
  value,
  onFieldChange,
  onFieldRemove,
  onFieldUpload,
  onFieldUploadElectron,
  onFieldAdd,
  notAddedFields,
}: IEditInputProps) {
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
      <InputArray
        {...{
          schema,
          label,
          value,
          description,
          onFieldChange,
          onFieldRemove,
        }}
      />
    );

  case "object":
    return (
      <InputObject
        {...{
          label,
          value,
          description,
          schema,
          onFieldChange,
          onFieldRemove,
        }}
      />
    );

  case "text":
  case "schema":
    return (
      <InputTextarea
        {...{
          label,
          value,
          description,
          onFieldChange,
          onFieldRemove,
        }}
      />
    );

  case "date":
    return (
      <InputDate
        {...{
          label,
          value,
          description,
          onFieldChange,
          onFieldRemove,
        }}
      />
    );

  case "path":
    return (
      <InputUpload
        {...{
          label,
          description,
          onFieldUpload,
          onFieldUploadElectron,
        }}
      />
    );

  default:
    if (label === "UUID") {
      return (
        <div>
          <div>{description}</div>

          <div>{value}</div>

          <InputPropsDropdown {...{ schema, notAddedFields, onFieldAdd }} />
        </div>
      );
    } else {
      return (
        <InputText
          {...{
            label,
            value,
            description,
            onFieldChange,
            onFieldRemove,
          }}
        />
      );
    }
  }
}
