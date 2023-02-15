import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useStore } from "@/store";
import { Dispenser } from "@/api";
import { manifestRoot } from "@/../lib/git_template"
import { FieldText } from "..";

interface IViewFieldProps {
  entry: any;
}

export default function ViewField({ entry }: IViewFieldProps) {
  const { i18n } = useTranslation();

  const [isOpen, setIsOpen] = useState(false);

  const [
    baseEntry,
    isSettings,
  ] = useStore((state) => [
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
          <div>
            {branchType === "array" ? (
              <div>
                { entry.items.map((item: any, index: any) => (
                  <div key={index}>
                    <ViewField entry={item}/>
                  </div>
                )) }
              </div>
            ) : trunk === "tags" ? (
              <Dispenser {...{ baseEntry, branchEntry: entry }}/>
            ) : branchType === "object" ? (
              <div>
                { Object.keys(entry).map((field: any, index: any) => (
                  <div key={index}>
                    <ViewField entry={{'|': field, [field]: entry[field]}}/>
                  </div>
                )) }
              </div>
            ) : (
              <FieldText value={entry[branch]} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
