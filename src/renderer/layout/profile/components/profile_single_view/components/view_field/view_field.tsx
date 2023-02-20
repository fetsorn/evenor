import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useStore } from "@/store";
import { Dispenser } from "lib/dispensers";
import { API, manifestRoot } from "lib/api";
import { FieldText } from "..";

interface IViewFieldProps {
  entry: any;
}

export default function ViewField({ entry }: IViewFieldProps) {
  const { i18n } = useTranslation();

  const [isOpen, setIsOpen] = useState(false);

  const [
    repoRoute,
    baseEntry,
    isSettings,
  ] = useStore((state) => [
    state.repoRoute,
    state.entry,
    state.isSettings,
  ])

  const schema = isSettings ? JSON.parse(manifestRoot) : useStore((state) => state.schema);

  const branch = entry['|'];

  const branchType = schema[branch]?.type;

  const branchDescription = schema?.[branch]?.description?.[i18n.resolvedLanguage] ?? branch;

  const trunk = schema[branch]?.trunk;

  return (
    <div>
      {branchType === "array" ? (
        <div>
          {!isOpen ? (
            <div>
              <a onClick={() => setIsOpen(true)}>▶️</a>

              {branchDescription}
            </div>
          ) : (
            <div>
              <div>
                <a onClick={() => setIsOpen(false)}>🔽</a>

                {branchDescription}
              </div>

              {entry.UUID}

              { entry.items.map((item: any, index: any) => (
                <div key={index}>
                  <ViewField entry={item}/>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : trunk === "tags" ? (
        <div>
          {!isOpen ? (
            <div>
              <a onClick={() => setIsOpen(true)}>▶️</a>

              {branchDescription}
            </div>
          ) : (
            <div>
              <div>
                <a onClick={() => setIsOpen(false)}>🔽</a>

                {branchDescription}
              </div>

              <Dispenser {...{ baseEntry, branchEntry: entry, api: new API(repoRoute) }}/>
            </div>
          )}
        </div>
      ) : branchType === "object" ? (
        <div>
          {!isOpen ? (
            <div>
              <a onClick={() => setIsOpen(true)}>▶️</a>

              {branchDescription}
            </div>
          ) : (
            <div>
              <div>
                <a onClick={() => setIsOpen(false)}>🔽</a>

                {branchDescription}
              </div>

              {entry.UUID}

              { Object.keys(entry).map((leaf: any, leafIndex: any) => {
                if (leaf === '|' || leaf === 'UUID') { return <></> }

                const leafEntry = schema[leaf]?.type === 'object'
                                 || schema[leaf]?.type === 'array'
                  ? entry[leaf]
                  : { '|': leaf, [leaf]: entry[leaf] };

                return (
                  <div key={leafIndex}>
                    <ViewField entry={leafEntry}/>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      ) : (
        <div>
          {branchDescription}

          <FieldText value={entry[branch]} />
        </div>
      )}
    </div>
  );
}
