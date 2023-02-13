import React from "react";
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
      {branchType === "array" ? (
        <div>
          <div>array {branchDescription} </div>
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
          <div>object {branchDescription}</div>
          { Object.keys(entry).map((field: any, index: any) => (
            <div key={index}>
              <FieldText label={branch} value={entry[branch]} />
            </div>
          )) }
        </div>
      ) : (
        <FieldText label={branch} value={entry[branch]} />
      )}
    </div>
  );
}
