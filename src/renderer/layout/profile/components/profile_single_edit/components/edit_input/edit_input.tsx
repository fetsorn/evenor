import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  InputTextarea,
  InputText,
  InputUpload,
  InputDate,
  InputArray,
  InputObject,
} from "..";
import {
  useEditStore
} from "../../profile_single_edit";

interface IEditInputProps {
  index: string;
  schema: any;
  entry: any;
  onFieldChange?: any;
  onFieldRemove?: any;
  onFieldUpload?: any;
  onFieldUploadElectron?: any;
  isBaseObject?: boolean
}

export default function EditInput({
  index,
  schema,
  entry,
  onFieldChange,
  onFieldRemove,
  onFieldUpload,
  onFieldUploadElectron,
  isBaseObject,
}: IEditInputProps) {
  const { i18n, t } = useTranslation();

  const branch = entry['|'];

  const value = entry[branch];

  const branchType = schema[branch]?.type;

  const branchTask = schema[branch]?.task;

  const description = schema?.[branch]?.description?.[i18n.resolvedLanguage] ?? branch;

  const openIndex = useEditStore((state) => state.openIndex);

  const mapIsOpen = useEditStore((state) => state.mapIsOpen);

  const [isOpen, setIsOpen] = useState(mapIsOpen[index])

  function open() {
    openIndex(index, true)

    setIsOpen(true)
  }

  function close() {
    openIndex(index, false)

    setIsOpen(false)
  }

  function Spoiler({ children }: any) {
    return (
      <div>
        {schema[branch].trunk === undefined ? children : (
          <div>
            {!isOpen ? (
              <div>
                <a onClick={open}>▶️</a>

                {description}

                <button
                  title={t("line.button.remove", { field: branch })}
                  onClick={() => onFieldRemove(branch)}
                >
                  X
                </button>
              </div>
            ) : (
              <div>
                <a onClick={close}>🔽</a>

                {description}

                <button
                  title={t("line.button.remove", { field: branch })}
                  onClick={() => onFieldRemove(branch)}
                >
                  X
                </button>

                {children}
              </div>
            )}
          </div>
        )}
      </div>
    )}

  // if non-array root, treat as object
  // if array root, treat as array later
  if (schema[branch].trunk === undefined
        && schema[branch].type !== 'array'
        && isBaseObject) {
    return (
      <Spoiler>
        <InputObject
          {...{
            schema,
            entry,
            onFieldChange,
          }}
        />
      </Spoiler>
    )
  }

  switch (branchTask) {
  case "text":
  case "schema":
    return (
      <Spoiler>
        <InputTextarea
          {...{
            branch,
            value,
            onFieldChange,
          }}
        />
      </Spoiler>
    );

  case "path":
    return (
      <Spoiler>
        <InputUpload
          {...{
            branch,
            value,
            onFieldChange,
            onFieldUpload,
            onFieldUploadElectron,
          }}
        />
      </Spoiler>
    );

  case "date":
    return (
      <Spoiler>
        <InputDate
          {...{
            branch,
            value,
            onFieldChange,
          }}
        />
      </Spoiler>
    );


  default:
    switch (branchType) {
    case "array":
      return (
        <Spoiler>
          <InputArray
            {...{
              schema,
              entry,
              onFieldChange,
            }}
          />
        </Spoiler>
      );

    case "object":
      return (
        <Spoiler>
          <InputObject
            {...{
              schema,
              entry,
              onFieldChange,
            }}
          />
        </Spoiler>
      );

    default:
      return (
        <Spoiler>
          <InputText
            {...{
              branch,
              value,
              onFieldChange,
            }}
          />
        </Spoiler>
      );
    }
  }
}
