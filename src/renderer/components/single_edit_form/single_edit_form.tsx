import React, { useMemo } from "react";
import {
  Paragraph,
  FormTextareaInput,
  FormTextInput,
  FormUploadInput,
  FormDateInput,
} from "..";
import { useTranslation } from "react-i18next";

interface ISingleEditFormProps {
  schema: any;
  entry: any;
  onInputChange: any;
  onInputRemove: any;
  onInputUpload: any;
  onInputUploadElectron: any;
}

export function getDescription(prop: any, schema: any, label: any) {
  const { i18n } = useTranslation();

  const lang = i18n.resolvedLanguage;
  const description = schema?.[prop]?.description?.[lang] ?? label;

  return description;
}

export default function SingleEditForm({
  schema,
  entry,
  onInputChange,
  onInputRemove,
  onInputUpload,
  onInputUploadElectron,
}: ISingleEditFormProps) {
  const addedFields = useMemo(
    () =>
      entry ? Object.keys(entry).filter((prop: any) => prop != "UUID") : [],
    [entry]
  );

  return (
    <>
      {entry && schema && (
        <div>
          <Paragraph>{entry?.UUID}</Paragraph>
          <form>
            {addedFields.map((label: any, key: any) => {
              /* console.log(entry); */
              const prop = Object.keys(schema).find(
                (prop: any) => schema[prop]["label"] === label
              );

              const root = Object.keys(schema).find(
                (prop: any) =>
                  !Object.prototype.hasOwnProperty.call(schema[prop], "parent")
              );

              const description = getDescription(prop, schema, label);

              const value = entry[label] ?? "";

              /* console.log(label, prop, root); */
              if (prop !== root && schema[prop]["type"] == "date") {
                /* console.log("DATE"); */
                return (
                  <FormDateInput
                    {...{
                      key,
                      description,
                      label,
                      value,
                      onInputChange,
                      onInputRemove,
                    }}
                  />
                );
              } else if (prop !== root && prop === "filepath") {
                return (
                  <FormUploadInput
                    {...{
                      key,
                      description,
                      label,
                      onInputUpload,
                      onInputUploadElectron,
                    }}
                  />
                );
              } else if (prop !== root) {
                <FormTextInput
                  {...{
                    key,
                    description,
                    label,
                    value,
                    onInputChange,
                    onInputRemove,
                  }}
                />;
              } else {
                return (
                  <FormTextareaInput
                    {...{
                      key,
                      description,
                      label,
                      value,
                      onInputChange,
                      onInputRemove,
                    }}
                  />
                );
              }
            })}
          </form>
        </div>
      )}
    </>
  );
}
