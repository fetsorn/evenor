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
  onInputChange?: any;
  onInputRemove?: any;
  onInputUpload?: any;
  onInputUploadElectron?: any;
  onAddProp?: any;
  notAddedFields?: any;
}

export default function EditInput({
  schema,
  label,
  value,
  onInputChange,
  onInputRemove,
  onInputUpload,
  onInputUploadElectron,
  onAddProp,
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
          onInputChange,
          onInputRemove,
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
          onInputChange,
          onInputRemove,
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
          onInputChange,
          onInputRemove,
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
          onInputChange,
          onInputRemove,
        }}
      />
    );

  case "path":
    return (
      <InputUpload
        {...{
          label,
          description,
          onInputUpload,
          onInputUploadElectron,
        }}
      />
    );

  default:
    if (label === "UUID") {
      return (
        <div>
          <div>{description}</div>

          <div>{value}</div>

          <InputPropsDropdown {...{ schema, notAddedFields, onAddProp }} />
        </div>
      );
    } else {
      return (
        <InputText
          {...{
            label,
            value,
            description,
            onInputChange,
            onInputRemove,
          }}
        />
      );
    }
  }
}
