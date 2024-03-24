import React, { useState, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { AssetView } from "../../../../components/index.js";
import { useStore } from "../../../../store/index.js";
import { FieldText } from "..";

const Dispenser = React.lazy(() => import("../dispenser/components/index.js"));

export function ViewField({ record, schema, isBaseObject }) {
  const { i18n, t } = useTranslation();

  const [isOpen, setIsOpen] = useState(false);

  const [isOpenUUID, setIsOpenUUID] = useState(false);

  const [baseRecord, repoUUID] = useStore((state) => [
    state.record,
    state.repoUUID,
  ]);

  const branch = record._;

  const branchType = schema[branch]?.type;

  const branchTask = schema[branch]?.task;

  const branchDescription =
    schema?.[branch]?.description?.[i18n.resolvedLanguage] ?? branch;

  const uuidDescription = t("profile.label.uuid");

  const trunk = schema[branch]?.trunk;

  if (trunk === undefined && branchType !== "array" && isBaseObject) {
    return (
      <div>
        <div>
          {!isOpenUUID ? (
            <div>
              <button type="button" onClick={() => setIsOpenUUID(true)}>
                ▶️
              </button>

              {uuidDescription}
            </div>
          ) : (
            <div>
              <div>
                <button type="button" onClick={() => setIsOpenUUID(false)}>
                  🔽
                </button>

                {uuidDescription}
              </div>

              {record.UUID}
            </div>
          )}
        </div>

        {Object.keys(record).map((leaf) => {
          if (leaf === "_" || leaf === "UUID") {
            return;
          }

          const leafRecord =
            schema[leaf]?.type === "object" || schema[leaf]?.type === "array"
              ? record[leaf]
              : { _: leaf, [leaf]: record[leaf] };

          return (
            <div key={(record.UUID ?? "") + leaf}>
              <ViewField record={leafRecord} schema={schema} />
            </div>
          );
        })}
      </div>
    );
  }

  if (trunk === "tags") {
    return (
      <div>
        {!isOpen ? (
          <div>
            <button type="button" onClick={() => setIsOpen(true)}>
              ▶️
            </button>

            {branchDescription}
          </div>
        ) : (
          <div>
            <div>
              <button type="button" onClick={() => setIsOpen(false)}>
                🔽
              </button>

              {branchDescription}
            </div>

            <Suspense>
              <Dispenser {...{ baseRecord, branchRecord: record }} />
            </Suspense>
          </div>
        )}
      </div>
    );
  }

  switch (branchType) {
    case "array":
      return (
        (repoUUID !== "root" || branch !== "schema") && (
          <div>
            {!isOpen ? (
              <div>
                <button type="button" onClick={() => setIsOpen(true)}>
                  ▶️
                </button>

                {branchDescription}
              </div>
            ) : (
              <div>
                <div>
                  <button type="button" onClick={() => setIsOpen(false)}>
                    🔽
                  </button>

                  {branchDescription}
                </div>

                <div>
                  {!isOpenUUID ? (
                    <div>
                      <button type="button" onClick={() => setIsOpenUUID(true)}>
                        ▶️
                      </button>

                      {uuidDescription}
                    </div>
                  ) : (
                    <div>
                      <div>
                        <button
                          type="button"
                          onClick={() => setIsOpenUUID(false)}
                        >
                          🔽
                        </button>

                        {uuidDescription}
                      </div>

                      {record.UUID}
                    </div>
                  )}
                </div>

                {record.items.map((item) => (
                  <div key={`array_item_${Math.random()}`}>
                    <ViewField record={item} schema={schema} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      );

    case "object":
      if (branchTask === "file") {
        return <AssetView {...{ record, schema }} />;
      }

      return (
        <div>
          {!isOpen ? (
            <div>
              <button type="button" onClick={() => setIsOpen(true)}>
                ▶️
              </button>

              {branchDescription}
            </div>
          ) : (
            <div>
              <div>
                <button type="button" onClick={() => setIsOpen(false)}>
                  🔽
                </button>

                {branchDescription}
              </div>

              <div>
                {!isOpenUUID ? (
                  <div>
                    <button type="button" onClick={() => setIsOpenUUID(true)}>
                      ▶️
                    </button>

                    {uuidDescription}
                  </div>
                ) : (
                  <div>
                    <div>
                      <button
                        type="button"
                        onClick={() => setIsOpenUUID(false)}
                      >
                        🔽
                      </button>

                      {uuidDescription}
                    </div>

                    {record.UUID}
                  </div>
                )}
              </div>

              {Object.keys(record).map((leaf) => {
                if (leaf === "_" || leaf === "UUID") {
                  return <div />;
                }

                const leafRecord =
                  schema[leaf]?.type === "object" ||
                  schema[leaf]?.type === "array"
                    ? record[leaf]
                    : { _: leaf, [leaf]: record[leaf] };

                return (
                  <div key={(record.UUID ?? "") + leaf}>
                    <ViewField record={leafRecord} schema={schema} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );

    default:
      if (branchTask === "filename") {
        return <AssetView {...{ record, schema }} />;
      }

      return (
        <div>
          {branchDescription}

          <FieldText value={record[branch]} />
        </div>
      );
  }
}
