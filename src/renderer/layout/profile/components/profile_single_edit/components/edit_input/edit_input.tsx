import React from "react";
import {
  InputTextarea,
  InputText,
  InputUpload,
  InputDate,
  InputDropdown,
  InputArray,
  InputObject,
} from "..";
import { useTranslation } from "react-i18next";

interface IEditInputProps {
  schema: any;
  entry: any;
  onFieldChange?: any;
  onFieldRemove?: any;
  onFieldUpload?: any;
  onFieldUploadElectron?: any;
  onFieldAdd?: any;
  notAddedFields?: any;
}

export default function EditInput({
  schema,
  entry,
  onFieldChange,
  onFieldRemove,
  onFieldUpload,
  onFieldUploadElectron,
  onFieldAdd,
  notAddedFields,
}: IEditInputProps) {
  const { i18n } = useTranslation();

  const branch = entry['|'];

  const value = entry[branch];

  const branchType = schema[branch]?.type;

  const branchTask = schema[branch]?.task;

  const lang = i18n.resolvedLanguage;

  const description = schema?.[branch]?.description?.[lang] ?? branch;

  switch (branchTask) {
  case "text":
  case "schema":
    return (
      <InputTextarea
        {...{
          branch,
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
          branch,
          value,
          description,
          onFieldRemove,
          onFieldChange,
          onFieldUpload,
          onFieldUploadElectron,
        }}
      />
    );

  default:
    switch (branchType) {
    case "array":
      return (
        <InputArray
          {...{
            schema,
            entry,
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
            schema,
            entry,
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
            branch,
            value,
            description,
            onFieldChange,
            onFieldRemove,
          }}
        />
      );

    default:
      if (branch === "UUID") {
        return (
          <div>
            <div>{description}</div>

            <div>{value}</div>

            <InputDropdown {...{ schema, fields: notAddedFields, onFieldAdd }} />
          </div>
        );
      } else {
        return (
          <InputText
            {...{
              branch,
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
}
