import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  InputTextarea,
  InputText,
  InputUpload,
  InputDate,
  InputArray,
  InputObject,
} from '..';
import {
  useEditStore,
} from '../../profile_single_edit.jsx';

export function EditInput({
  index,
  schema,
  entry,
  onFieldChange,
  onFieldRemove,
  isBaseObject,
}) {
  const { i18n, t } = useTranslation();

  const branch = entry._;

  const value = entry[branch];

  const branchType = schema[branch]?.type;

  const branchTask = schema[branch]?.task;

  const description = schema?.[branch]?.description?.[i18n.resolvedLanguage] ?? branch;

  const openIndex = useEditStore((state) => state.openIndex);

  const mapIsOpen = useEditStore((state) => state.mapIsOpen);

  const [isOpen, setIsOpen] = useState(mapIsOpen[index]);

  function open() {
    openIndex(index, true);

    setIsOpen(true);
  }

  function close() {
    openIndex(index, false);

    setIsOpen(false);
  }

  // TODO: find a way to wrap the Spoiler and Label
  // in a component with a children prop
  // without losing input focus after onFieldChange

  // if non-array root, treat as object
  // if array root, treat as array later
  if (schema[branch].trunk === undefined
        && schema[branch].type !== 'array'
        && isBaseObject) {
    return (
      <InputObject
        {...{
          schema,
          entry,
          onFieldChange,
        }}
      />
    );
  }

  switch (branchType) {
    case 'array':
      return (
        <div>
          {schema[branch].trunk === undefined ? (
            <InputArray
              {...{
                schema,
                entry,
                onFieldChange,
              }}
            />
          ) : (
            <div>
              {!isOpen ? (
                <div>
                  <a onClick={open}>▶️</a>

                  {description}

                  <button
                    title={t('line.button.remove', { field: branch })}
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
                    title={t('line.button.remove', { field: branch })}
                    onClick={() => onFieldRemove(branch)}
                  >
                    X
                  </button>

                  <InputArray
                    {...{
                      schema,
                      entry,
                      onFieldChange,
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      );

    case 'object':
      return (
        <div>
          {!isOpen ? (
            <div>
              <a onClick={open}>▶️</a>

              {description}

              <button
                title={t('line.button.remove', { field: branch })}
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
                title={t('line.button.remove', { field: branch })}
                onClick={() => onFieldRemove(branch)}
              >
                X
              </button>

              <InputObject
                {...{
                  schema,
                  entry,
                  onFieldChange,
                }}
              />
            </div>
          )}
        </div>
      );

    default:
      switch (branchTask) {
        case 'text':
          return (
            <div>
              {!isOpen ? (
                <div>
                  <a onClick={open}>▶️</a>

                  {description}

                  <button
                    title={t('line.button.remove', { field: branch })}
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
                    title={t('line.button.remove', { field: branch })}
                    onClick={() => onFieldRemove(branch)}
                  >
                    X
                  </button>

                  <InputTextarea
                    {...{
                      branch,
                      value,
                      onFieldChange,
                    }}
                  />
                </div>
              )}
            </div>
          );

        case 'path':
          return (
            <div>
              {description}

              <button
                title={t('line.button.remove', { field: branch })}
                onClick={() => onFieldRemove(branch)}
              >
                X
              </button>

              <InputUpload
                {...{
                  branch,
                  value,
                  onFieldChange,
                }}
              />
            </div>
          );

        case 'date':
          return (
            <div>
              {description}

              <button
                title={t('line.button.remove', { field: branch })}
                onClick={() => onFieldRemove(branch)}
              >
                X
              </button>

              <InputDate
                {...{
                  branch,
                  value,
                  onFieldChange,
                }}
              />
            </div>
          );

        default:
          return (
            <div>
              {description}

              <button
                title={t('line.button.remove', { field: branch })}
                onClick={() => onFieldRemove(branch)}
              >
                X
              </button>

              <InputText
                {...{
                  branch,
                  value,
                  onFieldChange,
                }}
              />
            </div>
          );
      }
  }
}
