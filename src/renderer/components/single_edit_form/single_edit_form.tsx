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

export default function SingleEditForm({
  schema,
  entry,
  onInputChange,
  onInputRemove,
  onInputUpload,
  onInputUploadElectron,
}: ISingleEditFormProps) {
  const { i18n } = useTranslation();

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
            {addedFields.map((label: any, index: any) => {
              const prop = Object.keys(schema).find(
                (prop: any) => schema[prop]["label"] === label
              );

              const root = Object.keys(schema).find(
                (prop: any) =>
                  !Object.prototype.hasOwnProperty.call(schema[prop], "parent")
              );

              const lang = i18n.resolvedLanguage;

              const description = schema?.[prop]?.description?.[lang] ?? label;

              const value = entry[label] ?? "";

              return (
                <div key={index}>
                  {prop === root ? (
                    <FormTextareaInput
                      {...{
                        description,
                        label,
                        value,
                        onInputChange,
                        onInputRemove,
                      }}
                    />
                  ) : schema[prop]["type"] == "date" ? (
                    <FormDateInput
                      {...{
                        description,
                        label,
                        value,
                        onInputChange,
                        onInputRemove,
                      }}
                    />
                  ) : prop === "filepath" ? (
                    <FormUploadInput
                      {...{
                        description,
                        label,
                        onInputUpload,
                        onInputUploadElectron,
                      }}
                    />
                  ) : (
                    <FormTextInput
                      {...{
                        description,
                        label,
                        value,
                        onInputChange,
                        onInputRemove,
                      }}
                    />
                  )}
                </div>
              );
            })}
          </form>
        </div>
      )}
    </>
  );
}
