import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useStore } from "@/store";
import { Dispenser } from "@/api";
import { manifestRoot } from "@/../lib/git_template"
import { FieldText } from "..";

interface IViewFieldProps {
  label: any;
  value: any;
}

export default function ViewField({ label, value }: IViewFieldProps) {
  const { i18n } = useTranslation();

  const [
    entry,
    repoRoute,
    isSettings,
  ] = useStore((state) => [
    state.entry,
    state.repoRoute,
    state.isSettings,
  ])

  const schema = isSettings ? JSON.parse(manifestRoot) : useStore((state) => state.schema);

  const prop = useMemo(() => {
    return Object.keys(schema).find((p) => schema[p].label === label) ?? label;
  }, [schema, label]);

  const propType = useMemo(() => {
    const propType = schema[prop]?.type;

    return propType;
  }, [schema, label]);

  const propDescription = useMemo(() => {
    const lang = i18n.resolvedLanguage;

    const description = schema?.[prop]?.description?.[lang] ?? label;

    return description;
  }, [schema, label]);

  const propTrunk = useMemo(() => {
    return schema[prop]?.trunk;
  }, [schema, label]);

  return (
    <div>
      {propType === "array" ? (
        <div>
          <div>array {propDescription} </div>
          { value.items.map((item: any, index: any) => (
            <div key={index}>
              <ViewField label={item.ITEM_NAME} value={item} />
            </div>
          )) }
        </div>
      ) : propTrunk === "tags" ? (
        <Dispenser {...{ repoRoute, schema, entry, field: prop, value }}/>
      ) : propType === "object" ? (
        <div>
          <div>object {propDescription}</div>
          { Object.keys(value).map((field: any, index: any) => (
            <div key={index}>
              <FieldText {...{ schema }} label={field} value={value[field]} />
            </div>
          )) }
        </div>
      ) : (
        <FieldText {...{ schema, label, value }} />
      )}
    </div>
  );
}
